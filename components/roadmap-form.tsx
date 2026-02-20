'use client';

import { useState, useEffect } from 'react';
import type { PrioritizationStrategy } from '@/lib/roadmap-types';

export function RoadmapForm({
  organisationId,
  onSuccess,
}: {
  organisationId: string;
  onSuccess: (result: Record<string, unknown>) => void;
}) {
  const [currentData, setCurrentData] = useState('');
  const [targetData, setTargetData] = useState('100');
  const [currentAi, setCurrentAi] = useState('');
  const [targetAi, setTargetAi] = useState('100');
  const [prioritization, setPrioritization] = useState<PrioritizationStrategy>('strategic_alignment');
  const [useFinancialImpact, setUseFinancialImpact] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/organisations/${organisationId}/data-audit`).then((r) => r.json()),
      fetch(`/api/organisations/${organisationId}/ai-audit`).then((r) => r.json()),
      fetch(`/api/organisations/${organisationId}/financial-impact`).then((r) => r.json()),
    ])
      .then(([dataRes, aiRes, finRes]) => {
        const dataLatest = Array.isArray(dataRes) ? dataRes[0] : null;
        const aiLatest = Array.isArray(aiRes) ? aiRes[0] : null;
        const finLatest = Array.isArray(finRes) ? finRes[0] : null;
        if (dataLatest?.maturity_index != null && !currentData) setCurrentData(String(dataLatest.maturity_index));
        if (aiLatest?.maturity_score != null && !currentAi) setCurrentAi(String(aiLatest.maturity_score));
      })
      .catch(() => {});
  }, [organisationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const cD = clamp(parseFloat(currentData) || 0, 0, 100);
    const tD = clamp(parseFloat(targetData) || 100, 0, 100);
    const cA = clamp(parseFloat(currentAi) || 0, 0, 100);
    const tA = clamp(parseFloat(targetAi) || 100, 0, 100);

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        current_data_maturity: cD,
        target_data_maturity: tD,
        current_ai_maturity: cA,
        target_ai_maturity: tA,
        prioritization,
      };

      if (useFinancialImpact) {
        const finRes = await fetch(`/api/organisations/${organisationId}/financial-impact`).then((r) => r.json());
        const finLatest = Array.isArray(finRes) ? finRes[0] : null;
        if (finLatest) {
          const rev = Number(finLatest.revenue_upside ?? 0);
          const margin = Number(finLatest.profit_margin_expansion_value ?? 0);
          const cost = Number(finLatest.cost_reduction ?? 0);
          body.financial_impact = {
            revenue_upside: rev,
            profit_margin_expansion_value: margin,
            cost_reduction: cost,
            total_impact: rev + margin + cost,
          };
        }
      }

      const res = await fetch(`/api/organisations/${organisationId}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Roadmap generation failed');
      onSuccess(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Roadmap generation failed');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 max-w-lg">
      <h3 className="font-semibold text-zinc-900">Generate transformation roadmap</h3>
      <p className="text-sm text-zinc-600">
        Current and target data/AI maturity (0–100). Roadmap phases and actions are derived from gaps and optional financial impact.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Current Data Maturity</label>
          <input
            type="number"
            min={0}
            max={100}
            value={currentData}
            onChange={(e) => setCurrentData(e.target.value)}
            className="input-field"
            placeholder="From Data Audit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Target Data Maturity</label>
          <input
            type="number"
            min={0}
            max={100}
            value={targetData}
            onChange={(e) => setTargetData(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Current AI Maturity</label>
          <input
            type="number"
            min={0}
            max={100}
            value={currentAi}
            onChange={(e) => setCurrentAi(e.target.value)}
            className="input-field"
            placeholder="From AI Audit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Target AI Maturity</label>
          <input
            type="number"
            min={0}
            max={100}
            value={targetAi}
            onChange={(e) => setTargetAi(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Prioritization</label>
        <select
          value={prioritization}
          onChange={(e) => setPrioritization(e.target.value as PrioritizationStrategy)}
          className="input-field max-w-xs"
        >
          <option value="strategic_alignment">Strategic alignment (foundation first)</option>
          <option value="highest_roi_first">Highest ROI first</option>
          <option value="lowest_cost_first">Lowest cost first</option>
        </select>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={useFinancialImpact}
          onChange={(e) => setUseFinancialImpact(e.target.checked)}
        />
        <span className="text-sm text-zinc-700">Use latest Financial Impact to scale projected impact</span>
      </label>
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Generating…' : 'Generate roadmap'}
      </button>
    </form>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
