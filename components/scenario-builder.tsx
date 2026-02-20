'use client';

import { useState, useEffect } from 'react';
import type { ScenarioParameters } from '@/lib/strategic-simulation-types';

type InvestmentLevel = 'low' | 'medium' | 'high';
type AdoptionPace = 'conservative' | 'moderate' | 'aggressive';
type MarketConditions = 'stable' | 'volatile' | 'growth';
type CompetitiveAction = 'status_quo' | 'invests_heavily';

interface ScenarioRow {
  name: string;
  investment_level: InvestmentLevel;
  adoption_pace: AdoptionPace;
  market_conditions: MarketConditions;
  competitive_action: CompetitiveAction;
  horizon_years: string;
}

const DEFAULT_ROW: ScenarioRow = {
  name: '',
  investment_level: 'medium',
  adoption_pace: 'moderate',
  market_conditions: 'stable',
  competitive_action: 'status_quo',
  horizon_years: '5',
};

export function ScenarioBuilder({
  organisationId,
  onRun,
  running,
}: {
  organisationId: string;
  onRun: (scenarios: { name: string; parameters: ScenarioParameters }[]) => void;
  running: boolean;
}) {
  const [context, setContext] = useState<{ current_data_maturity: number; current_ai_maturity: number; current_revenue: number } | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([{ ...DEFAULT_ROW, name: 'Baseline' }]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/organisations/${organisationId}/strategic-simulation`)
      .then((r) => r.json())
      .then(setContext)
      .catch(() => setContext(null));
  }, [organisationId]);

  const addScenario = () => {
    setScenarios((s) => [...s, { ...DEFAULT_ROW, name: `Scenario ${s.length + 1}` }]);
  };

  const removeScenario = (index: number) => {
    setScenarios((s) => s.filter((_, i) => i !== index));
  };

  const updateScenario = (index: number, field: keyof ScenarioRow, value: string | number) => {
    setScenarios((s) => s.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const run = () => {
    const payload = scenarios.map((s) => ({
      name: s.name.trim() || 'Unnamed',
      parameters: {
        investment_level: s.investment_level,
        adoption_pace: s.adoption_pace,
        market_conditions: s.market_conditions,
        competitive_action: s.competitive_action,
        horizon_years: parseFloat(s.horizon_years) || 5,
      } as ScenarioParameters,
    }));
    const invalid = payload.some((p) => (p.parameters.horizon_years ?? 5) <= 0 || (p.parameters.horizon_years ?? 5) > 10);
    if (invalid) {
      setError('Horizon must be 1–10 years.');
      return;
    }
    setError('');
    onRun(payload);
  };

  return (
    <div className="space-y-4">
      {context && (
        <div className="text-sm text-zinc-600">
          Current maturity: Data {context.current_data_maturity.toFixed(0)} / AI {context.current_ai_maturity.toFixed(0)}
          {context.current_revenue != null && ` · Revenue context: £${(context.current_revenue / 1e6).toFixed(2)}M`}
        </div>
      )}
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>}
      <div className="space-y-3">
        {scenarios.map((row, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 flex flex-wrap items-end gap-3">
            <div className="w-32">
              <label className="block text-xs text-zinc-500 mb-1">Name</label>
              <input
                type="text"
                value={row.name}
                onChange={(e) => updateScenario(i, 'name', e.target.value)}
                placeholder="Scenario name"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Investment</label>
              <select
                value={row.investment_level}
                onChange={(e) => updateScenario(i, 'investment_level', e.target.value as InvestmentLevel)}
                className="input-field w-28"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Pace</label>
              <select
                value={row.adoption_pace}
                onChange={(e) => updateScenario(i, 'adoption_pace', e.target.value as AdoptionPace)}
                className="input-field w-32"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Market</label>
              <select
                value={row.market_conditions}
                onChange={(e) => updateScenario(i, 'market_conditions', e.target.value as MarketConditions)}
                className="input-field w-28"
              >
                <option value="stable">Stable</option>
                <option value="volatile">Volatile</option>
                <option value="growth">Growth</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Competition</label>
              <select
                value={row.competitive_action}
                onChange={(e) => updateScenario(i, 'competitive_action', e.target.value as CompetitiveAction)}
                className="input-field w-36"
              >
                <option value="status_quo">Status quo</option>
                <option value="invests_heavily">Competitor invests</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Years</label>
              <input
                type="number"
                min={1}
                max={10}
                value={row.horizon_years}
                onChange={(e) => updateScenario(i, 'horizon_years', e.target.value)}
                className="input-field w-20"
              />
            </div>
            <button type="button" onClick={() => removeScenario(i)} className="text-red-600 text-sm hover:underline">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <button type="button" onClick={addScenario} className="text-indigo-600 text-sm hover:underline">
          + Add scenario
        </button>
        <button type="button" onClick={run} disabled={running} className="btn-primary">
          {running ? 'Running…' : 'Run simulation'}
        </button>
      </div>
    </div>
  );
}
