'use client';

import { useState, useEffect } from 'react';
import { INDUSTRY_BENCHMARKS } from '@/lib/industry-benchmarks';

export function FinancialImpactForm({
  organisationId,
  onSuccess,
}: {
  organisationId: string;
  onSuccess: (result: Record<string, unknown>) => void;
}) {
  const [revenue, setRevenue] = useState('');
  const [profitMarginPct, setProfitMarginPct] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [operationalCost, setOperationalCost] = useState('');
  const [dataMaturityScore, setDataMaturityScore] = useState('');
  const [aiMaturityScore, setAiMaturityScore] = useState('');
  const [industryBenchmarkId, setIndustryBenchmarkId] = useState('default');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/organisations/${organisationId}/data-audit`).then((r) => r.json()),
      fetch(`/api/organisations/${organisationId}/ai-audit`).then((r) => r.json()),
    ]).then(([dataResults, aiResults]) => {
      const dataLatest = Array.isArray(dataResults) ? dataResults[0] : null;
      const aiLatest = Array.isArray(aiResults) ? aiResults[0] : null;
      if (dataLatest?.maturity_index != null && !dataMaturityScore) setDataMaturityScore(String(dataLatest.maturity_index));
      if (aiLatest?.maturity_score != null && !aiMaturityScore) setAiMaturityScore(String(aiLatest.maturity_score));
    }).catch(() => {});
  }, [organisationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const rev = parseFloat(revenue);
    const margin = parseFloat(profitMarginPct);
    const head = parseInt(headcount, 10) || 0;
    const dataScore = parseFloat(dataMaturityScore) || 0;
    const aiScore = parseFloat(aiMaturityScore) || 0;
    const opCost = operationalCost ? parseFloat(operationalCost) : undefined;

    if (isNaN(rev) || rev < 0) {
      setError('Enter a valid revenue (≥ 0)');
      return;
    }
    if (isNaN(margin) || margin < 0 || margin > 100) {
      setError('Profit margin must be 0–100');
      return;
    }
    if (isNaN(dataScore) || dataScore < 0 || dataScore > 100 || isNaN(aiScore) || aiScore < 0 || aiScore > 100) {
      setError('Data and AI maturity scores must be 0–100');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/organisations/${organisationId}/financial-impact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenue: rev,
          profit_margin_pct: margin,
          headcount: head,
          operational_cost: opCost,
          data_maturity_score: dataScore,
          ai_maturity_score: aiScore,
          industry_benchmark_id: industryBenchmarkId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');
      onSuccess(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation failed');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 max-w-lg">
      <h3 className="font-semibold text-zinc-900">Financial inputs</h3>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Revenue (currency)</label>
        <input
          type="number"
          min={0}
          step={1000}
          value={revenue}
          onChange={(e) => setRevenue(e.target.value)}
          className="input-field"
          placeholder="e.g. 10000000"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Profit margin (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={profitMarginPct}
          onChange={(e) => setProfitMarginPct(e.target.value)}
          className="input-field"
          placeholder="e.g. 15"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Headcount</label>
        <input
          type="number"
          min={0}
          value={headcount}
          onChange={(e) => setHeadcount(e.target.value)}
          className="input-field"
          placeholder="e.g. 500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Operational cost (optional)</label>
        <input
          type="number"
          min={0}
          step={1000}
          value={operationalCost}
          onChange={(e) => setOperationalCost(e.target.value)}
          className="input-field"
          placeholder="Leave blank to estimate from headcount"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Industry benchmark</label>
        <select
          value={industryBenchmarkId}
          onChange={(e) => setIndustryBenchmarkId(e.target.value)}
          className="input-field"
        >
          {INDUSTRY_BENCHMARKS.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Data Maturity (0–100)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={dataMaturityScore}
            onChange={(e) => setDataMaturityScore(e.target.value)}
            className="input-field"
            placeholder="From Data Audit"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">AI Maturity (0–100)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={aiMaturityScore}
            onChange={(e) => setAiMaturityScore(e.target.value)}
            className="input-field"
            placeholder="From AI Audit"
          />
        </div>
      </div>
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Calculating…' : 'Calculate financial impact'}
      </button>
    </form>
  );
}
