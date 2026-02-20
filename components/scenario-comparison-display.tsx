'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import type { SimulationOutcome, OutcomeAnalysis } from '@/lib/strategic-simulation-types';

const COLORS = ['rgb(99 102 241)', 'rgb(16 185 129)', 'rgb(245 158 11)', 'rgb(239 68 68)', 'rgb(139 92 246)'];

function formatCurrency(n: number): string {
  if (n >= 1e9) return `£${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `£${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `£${(n / 1e3).toFixed(2)}K`;
  return `£${Math.round(n)}`;
}

export function ScenarioComparisonDisplay({
  outcomes,
  analysis,
  selectedIndices,
}: {
  outcomes: SimulationOutcome[];
  analysis: OutcomeAnalysis | null;
  selectedIndices: number[];
}) {
  if (outcomes.length === 0) return null;

  const selected = selectedIndices.length > 0 ? selectedIndices.filter((i) => i >= 0 && i < outcomes.length) : outcomes.map((_, i) => i);
  const maxYears = Math.max(...outcomes.map((o) => o.yearly.length));

  const maturityChartData = Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1;
    const row: Record<string, number | string> = { year: `Y${year}` };
    selected.forEach((idx) => {
      const o = outcomes[idx];
      const y = o.yearly[i];
      if (y) {
        row[`${o.scenario_name}_data`] = y.data_maturity;
        row[`${o.scenario_name}_ai`] = y.ai_maturity;
      }
    });
    return row;
  });

  const profitChartData = Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1;
    const row: Record<string, number | string> = { year: `Y${year}` };
    selected.forEach((idx) => {
      const o = outcomes[idx];
      const y = o.yearly[i];
      if (y) row[o.scenario_name] = y.profit;
    });
    return row;
  });

  const endStateBars = selected.map((idx) => {
    const o = outcomes[idx];
    return {
      name: o.scenario_name.length > 20 ? o.scenario_name.slice(0, 18) + '…' : o.scenario_name,
      fullName: o.scenario_name,
      profit: o.end_profit,
      valuation: o.end_valuation,
      index: idx,
    };
  });

  return (
    <div className="space-y-8">
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Maturity progression</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={maturityChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              {selected.map((idx, i) => {
                const o = outcomes[idx];
                return (
                  <Line
                    key={`${o.scenario_name}-data`}
                    type="monotone"
                    dataKey={`${o.scenario_name}_data`}
                    name={`${o.scenario_name} (data)`}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Profit over time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(v: number | undefined) => [formatCurrency(v ?? 0), '']} />
              <Legend />
              {selected.map((idx, i) => {
                const o = outcomes[idx];
                return (
                  <Line
                    key={o.scenario_name}
                    type="monotone"
                    dataKey={o.scenario_name}
                    name={o.scenario_name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">End-state comparison</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={endStateBars} layout="vertical" margin={{ top: 8, right: 80, left: 0, bottom: 0 }}>
              <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number | undefined) => [formatCurrency(v ?? 0), '']} labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName} />
              <Bar dataKey="profit" name="End profit" fill="rgb(99 102 241)" radius={[0, 4, 4, 0]}>
                {endStateBars.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Summary</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="text-left py-2 font-medium text-zinc-700">Scenario</th>
              <th className="text-left py-2 font-medium text-zinc-700">End data/AI</th>
              <th className="text-left py-2 font-medium text-zinc-700">End profit</th>
              <th className="text-left py-2 font-medium text-zinc-700">End valuation</th>
              <th className="text-left py-2 font-medium text-zinc-700">Total profit</th>
              <th className="text-left py-2 font-medium text-zinc-700">Avg risk</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o, i) => (
              <tr key={i} className="border-b border-zinc-100">
                <td className="py-2 font-medium">{o.scenario_name}</td>
                <td className="py-2">{o.end_data_maturity.toFixed(0)} / {o.end_ai_maturity.toFixed(0)}</td>
                <td className="py-2">{formatCurrency(o.end_profit)}</td>
                <td className="py-2">{formatCurrency(o.end_valuation)}</td>
                <td className="py-2">{formatCurrency(o.total_profit_over_horizon)}</td>
                <td className="py-2">{o.avg_risk_over_horizon.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {analysis?.recommendations && analysis.recommendations.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Recommendations</h3>
          <ul className="space-y-4">
            {analysis.recommendations.map((r, i) => (
              <li key={i} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-medium text-zinc-900">{r.scenario_name} — {r.objective.replace('_', ' ')}</p>
                <p className="text-xs text-zinc-500 mt-1">Trade-offs: {r.trade_offs.join('; ')}</p>
                <p className="text-xs text-amber-700 mt-1">Risks: {r.risks.join('; ')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
