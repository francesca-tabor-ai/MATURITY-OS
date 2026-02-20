'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { InvestmentScenarioInput, SimulationResult, ComparisonResult } from '@/lib/investment-simulation-types';

function formatCurrency(n: number): string {
  if (n >= 1e9) return `£${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `£${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `£${(n / 1e3).toFixed(2)}K`;
  return `£${Math.round(n)}`;
}

type TargetArea = 'data' | 'ai' | 'both';

interface ScenarioRow {
  investment_amount: string;
  target_area: TargetArea;
  time_horizon_years: string;
}

export function InvestmentSimulationForm({ organisationId }: { organisationId: string }) {
  const [context, setContext] = useState<{ current_data_maturity: number; current_ai_maturity: number; current_revenue?: number; current_margin_pct?: number } | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([
    { investment_amount: '500000', target_area: 'data', time_horizon_years: '3' },
    { investment_amount: '500000', target_area: 'ai', time_horizon_years: '3' },
    { investment_amount: '1000000', target_area: 'both', time_horizon_years: '3' },
  ]);
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [saveResults, setSaveResults] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/organisations/${organisationId}/investment-simulation`)
      .then((r) => r.json())
      .then(setContext)
      .catch(() => setContext(null))
      .finally(() => setLoading(false));
  }, [organisationId]);

  const addScenario = () => {
    setScenarios((s) => [...s, { investment_amount: '500000', target_area: 'both', time_horizon_years: '3' }]);
  };

  const removeScenario = (index: number) => {
    setScenarios((s) => s.filter((_, i) => i !== index));
  };

  const updateScenario = (index: number, field: keyof ScenarioRow, value: string | TargetArea) => {
    setScenarios((s) => s.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const runSimulation = () => {
    const payload: InvestmentScenarioInput[] = scenarios.map((s) => ({
      investment_amount: parseFloat(s.investment_amount) || 0,
      target_area: s.target_area,
      time_horizon_years: parseFloat(s.time_horizon_years) || 3,
      current_revenue: context?.current_revenue,
      current_margin_pct: context?.current_margin_pct,
    }));

    const invalid = payload.some((p) => p.investment_amount <= 0 || p.time_horizon_years <= 0);
    if (invalid) {
      setError('Investment amount and time horizon must be positive.');
      return;
    }

    setRunning(true);
    setError('');
    fetch(`/api/organisations/${organisationId}/investment-simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarios: payload, save: saveResults }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok) {
          setResults(data.results ?? []);
          setComparison(data.comparison ?? null);
        } else setError(data?.error ?? 'Simulation failed');
      })
      .catch(() => setError('Simulation failed'))
      .finally(() => setRunning(false));
  };

  if (loading && !context) {
    return <div className="py-8 text-center text-zinc-500">Loading…</div>;
  }

  const chartData = (results ?? []).map((r, i) => ({
    name: `Scenario ${i + 1}`,
    label: `${formatCurrency(r.investment_amount)} ${r.target_area}`,
    profit: r.projected_profit_increase,
    revenue: r.projected_revenue_increase,
    scenario_index: i,
  }));

  const bestByImpact = comparison?.best_by_impact ?? 0;
  const bestByROI = comparison?.best_by_cost_effectiveness ?? 0;

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {context && (
        <div className="glass-card p-4 flex flex-wrap gap-4 text-sm text-zinc-600">
          <span>Current data maturity: <strong>{context.current_data_maturity.toFixed(0)}</strong></span>
          <span>Current AI maturity: <strong>{context.current_ai_maturity.toFixed(0)}</strong></span>
          {context.current_revenue != null && <span>Revenue (for projection): {formatCurrency(context.current_revenue)}</span>}
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Investment scenarios</h3>
        <p className="text-xs text-zinc-500 mb-4">Add one or more scenarios to compare outcomes.</p>
        {scenarios.map((row, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3 mb-4 p-3 rounded-lg bg-zinc-50">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Investment (£)</label>
              <input
                type="number"
                min={0}
                step={10000}
                value={row.investment_amount}
                onChange={(e) => updateScenario(i, 'investment_amount', e.target.value)}
                className="input-field w-32"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Target</label>
              <select
                value={row.target_area}
                onChange={(e) => updateScenario(i, 'target_area', e.target.value as TargetArea)}
                className="input-field w-28"
              >
                <option value="data">Data</option>
                <option value="ai">AI</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Years</label>
              <input
                type="number"
                min={0.5}
                max={10}
                step={0.5}
                value={row.time_horizon_years}
                onChange={(e) => updateScenario(i, 'time_horizon_years', e.target.value)}
                className="input-field w-20"
              />
            </div>
            <button type="button" onClick={() => removeScenario(i)} className="text-red-600 text-sm hover:underline">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addScenario} className="text-indigo-600 text-sm hover:underline mb-4">
          + Add scenario
        </button>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={saveResults} onChange={(e) => setSaveResults(e.target.checked)} />
            Save results to history
          </label>
          <button type="button" onClick={runSimulation} disabled={running} className="btn-primary">
            {running ? 'Running…' : 'Run simulation'}
          </button>
        </div>
      </div>

      {results != null && results.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Simulation results</h3>
          <div className="h-72 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 60 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => formatCurrency(v)} />
                <Tooltip formatter={(v: number | undefined) => [v != null ? formatCurrency(v) : '—', 'Projected profit increase']} />
                <Bar dataKey="profit" fill="rgb(99 102 241)" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={idx === bestByImpact ? 'rgb(16 185 129)' : 'rgb(99 102 241)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Green bar = highest projected profit.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 font-medium text-zinc-700">Scenario</th>
                  <th className="text-left py-2 font-medium text-zinc-700">Investment</th>
                  <th className="text-left py-2 font-medium text-zinc-700">Target</th>
                  <th className="text-left py-2 font-medium text-zinc-700">Profit increase</th>
                  <th className="text-left py-2 font-medium text-zinc-700">Return/unit</th>
                  <th className="text-left py-2 font-medium text-zinc-700">Time to benefit</th>
                  <th className="text-left py-2 font-medium text-zinc-700">Risk</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-zinc-100">
                    <td className="py-2">
                      Scenario {i + 1}
                      {i === bestByImpact && <span className="ml-1 text-emerald-600 text-xs">(best impact)</span>}
                      {i === bestByROI && i !== bestByImpact && <span className="ml-1 text-indigo-600 text-xs">(best ROI)</span>}
                    </td>
                    <td className="py-2">{formatCurrency(r.investment_amount)}</td>
                    <td className="py-2">{r.target_area}</td>
                    <td className="py-2 font-medium">{formatCurrency(r.projected_profit_increase)}</td>
                    <td className="py-2">{r.return_per_unit.toFixed(2)}</td>
                    <td className="py-2">{r.effective_time_to_benefit_years.toFixed(1)} yr</td>
                    <td className="py-2">
                      <span className={comparison?.scenarios[i]?.risk_indicator === 'high' ? 'text-red-600' : comparison?.scenarios[i]?.risk_indicator === 'medium' ? 'text-amber-600' : 'text-zinc-600'}>
                        {comparison?.scenarios[i]?.risk_indicator ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
