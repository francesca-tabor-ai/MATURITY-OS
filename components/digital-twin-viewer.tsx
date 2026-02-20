'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import type {
  DigitalTwinState,
  SimulatedTwinState,
  OptimizedTransformationPlan,
  TwinIntervention,
  TwinGoal,
} from '@/lib/digital-twin-types';

function formatCurrency(n: number): string {
  if (n >= 1e9) return `£${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `£${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `£${(n / 1e3).toFixed(2)}K`;
  return `£${Math.round(n)}`;
}

/** KPI cards for current or simulated state */
function StateKPIs({ state, label }: { state: DigitalTwinState; label?: string }) {
  const { maturity, financial, risk } = state;
  const radarData = [
    { dimension: 'Data maturity', value: maturity.data_maturity_index, fullMark: 100 },
    { dimension: 'AI maturity', value: maturity.ai_maturity_score, fullMark: 100 },
    { dimension: 'Revenue (norm)', value: Math.min(100, (financial.revenue / 50_000_000) * 100), fullMark: 100 },
    { dimension: 'Risk (inv)', value: Math.max(0, 100 - risk.overall_risk_score), fullMark: 100 },
  ];
  return (
    <div className="space-y-4">
      {label && <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-zinc-500 mb-1">Data maturity</p>
          <p className="text-xl font-semibold text-zinc-900">{maturity.data_maturity_index.toFixed(1)}</p>
          <p className="text-xs text-zinc-400">Stage {maturity.data_maturity_stage}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-zinc-500 mb-1">AI maturity</p>
          <p className="text-xl font-semibold text-zinc-900">{maturity.ai_maturity_score.toFixed(1)}</p>
          <p className="text-xs text-zinc-400">Stage {maturity.ai_maturity_stage}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-zinc-500 mb-1">Revenue</p>
          <p className="text-xl font-semibold text-zinc-900">{formatCurrency(financial.revenue)}</p>
          <p className="text-xs text-zinc-400">Margin {financial.profit_margin_pct.toFixed(1)}%</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-zinc-500 mb-1">Risk</p>
          <p className="text-xl font-semibold text-zinc-900">{risk.overall_risk_score.toFixed(0)}</p>
          <p className="text-xs text-zinc-400">{risk.risk_level}</p>
        </div>
      </div>
      <div className="glass-card p-4 h-56">
        <p className="text-xs font-medium text-zinc-500 mb-2">Maturity & risk radar</p>
        <ResponsiveContainer width="100%" height="90%">
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
            <Radar name="Score" dataKey="value" stroke="rgb(99 102 241)" fill="rgb(99 102 241)" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Simple network: nodes as boxes, edges as lines (fixed layout for 6 nodes) */
function TwinGraph({ state }: { state: DigitalTwinState }) {
  const positions: Record<string, { x: number; y: number }> = {
    data_maturity: { x: 80, y: 50 },
    ai_maturity: { x: 220, y: 50 },
    revenue: { x: 220, y: 140 },
    profit: { x: 150, y: 200 },
    valuation: { x: 80, y: 140 },
    risk: { x: 80, y: 200 },
  };
  const nodeRadius = 28;
  const norm = (v: number, max: number) => Math.min(100, Math.max(0, (v / max) * 100));
  const nodeColor = (n: { id: string; value: number }) => {
    if (n.id === 'risk') return n.value > 60 ? 'rgb(239 68 68)' : n.value > 35 ? 'rgb(245 158 11)' : 'rgb(16 185 129)';
    return 'rgb(99 102 241)';
  };

  return (
    <div className="glass-card p-4">
      <p className="text-xs font-medium text-zinc-500 mb-3">Twin model (nodes & relationships)</p>
      <ResponsiveContainer width="100%" height={240}>
        <svg viewBox="0 0 300 260" className="w-full h-full">
          {state.edges.map((e, i) => {
            const src = positions[e.source_id];
            const tgt = positions[e.target_id];
            if (!src || !tgt) return null;
            return (
              <line
                key={`edge-${i}`}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke="rgb(203 213 225)"
                strokeWidth={1 + (e.strength ?? 0.5)}
                strokeOpacity={0.7}
              />
            );
          })}
          {state.nodes.map((n) => {
            const pos = positions[n.id];
            if (!pos) return null;
            const val = n.unit === '0-100' ? n.value : n.unit === 'currency' ? norm(n.value, 20_000_000) : n.value;
            const fill = nodeColor({ id: n.id, value: val });
            return (
              <g key={n.id}>
                <circle cx={pos.x} cy={pos.y} r={nodeRadius} fill={fill} fillOpacity={0.25} stroke={fill} strokeWidth={2} />
                <text x={pos.x} y={pos.y - 6} textAnchor="middle" fontSize="9" fill="#374151">{n.label}</text>
                <text x={pos.x} y={pos.y + 8} textAnchor="middle" fontSize="10" fontWeight="600" fill="#111">
                  {n.unit === 'currency' ? formatCurrency(n.value) : n.value.toFixed(0)}
                </text>
              </g>
            );
          })}
        </svg>
      </ResponsiveContainer>
    </div>
  );
}

export interface DigitalTwinViewerProps {
  organisationId: string;
  initialState: DigitalTwinState | null;
  onStateLoaded?: (state: DigitalTwinState) => void;
}

export function DigitalTwinViewer({
  organisationId,
  initialState,
  onStateLoaded,
}: DigitalTwinViewerProps) {
  const [state, setState] = useState<DigitalTwinState | null>(initialState ?? null);
  const [simulated, setSimulated] = useState<SimulatedTwinState | null>(null);
  const [plan, setPlan] = useState<OptimizedTransformationPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulateMonths, setSimulateMonths] = useState(12);
  const [optimizeGoal, setOptimizeGoal] = useState<TwinGoal['type']>('ai_maturity_stage');
  const [optimizeTarget, setOptimizeTarget] = useState(5);
  const [optimizeHorizon, setOptimizeHorizon] = useState(12);
  const [saveSnapshot, setSaveSnapshot] = useState(false);

  const loadCurrent = () => {
    setLoading(true);
    fetch(`/api/organisations/${organisationId}/digital-twin`)
      .then((r) => r.json())
      .then((d) => {
        if (d.state) {
          setState(d.state);
          setSimulated(null);
          onStateLoaded?.(d.state);
        }
      })
      .finally(() => setLoading(false));
  };

  const runSimulate = () => {
    setLoading(true);
    fetch(`/api/organisations/${organisationId}/digital-twin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'simulate',
        future_months: simulateMonths,
        interventions: [],
        save: saveSnapshot,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.simulated) {
          setSimulated(d.simulated);
          if (d.simulated.state) setState(d.simulated.state);
        }
      })
      .finally(() => setLoading(false));
  };

  const runOptimize = () => {
    setLoading(true);
    fetch(`/api/organisations/${organisationId}/digital-twin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'optimize',
        goal: {
          type: optimizeGoal,
          target_value: optimizeTarget,
          horizon_months: optimizeHorizon,
          minimize_risk: false,
        },
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) setPlan(d.plan);
      })
      .finally(() => setLoading(false));
  };

  const displayState = simulated?.state ?? state;
  const barData = useMemo(() => {
    if (!displayState) return [];
    const { maturity, financial, risk } = displayState;
    return [
      { name: 'Data mat.', value: maturity.data_maturity_index, fill: 'rgb(99 102 241)' },
      { name: 'AI mat.', value: maturity.ai_maturity_score, fill: 'rgb(16 185 129)' },
      { name: 'Risk', value: risk.overall_risk_score, fill: 'rgb(239 68 68)' },
      { name: 'Revenue (M)', value: financial.revenue / 1e6, fill: 'rgb(245 158 11)' },
    ];
  }, [displayState]);

  useEffect(() => {
    if (!state && organisationId) loadCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisationId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-center">
        <button
          type="button"
          onClick={loadCurrent}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-zinc-200 text-zinc-800 text-sm font-medium hover:bg-zinc-300 disabled:opacity-50"
        >
          Refresh twin
        </button>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input type="checkbox" checked={saveSnapshot} onChange={(e) => setSaveSnapshot(e.target.checked)} />
          Save snapshot when simulating
        </label>
      </div>

      {state && (
        <>
          <section>
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Current state</h2>
            <StateKPIs state={state} label={state.label} />
          </section>
          <section>
            <TwinGraph state={state} />
          </section>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Simulate future state</h3>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Months ahead</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={simulateMonths}
                    onChange={(e) => setSimulateMonths(Number(e.target.value) || 12)}
                    className="w-24 rounded border border-zinc-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={runSimulate}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  Run simulation
                </button>
              </div>
              {simulated && (
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <StateKPIs state={simulated.state} label={`Simulated (${simulated.months_ahead} months)`} />
                </div>
              )}
            </div>
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Optimize path</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Goal type</label>
                  <select
                    value={optimizeGoal}
                    onChange={(e) => setOptimizeGoal(e.target.value as TwinGoal['type'])}
                    className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm"
                  >
                    <option value="ai_maturity_stage">AI maturity stage</option>
                    <option value="data_maturity_stage">Data maturity stage</option>
                    <option value="profit_increase_pct">Profit increase %</option>
                    <option value="risk_reduction">Risk reduction</option>
                    <option value="revenue_increase_pct">Revenue increase %</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Target</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={optimizeTarget}
                      onChange={(e) => setOptimizeTarget(Number(e.target.value) || 5)}
                      className="w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Horizon (months)</label>
                    <input
                      type="number"
                      min={6}
                      max={48}
                      value={optimizeHorizon}
                      onChange={(e) => setOptimizeHorizon(Number(e.target.value) || 12)}
                      className="w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={runOptimize}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  Get optimized plan
                </button>
              </div>
            </div>
          </section>

          {displayState && barData.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Key metrics</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 24, left: 56, bottom: 4 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={56} />
                    <Tooltip formatter={(v: number | undefined) => [v != null ? v.toFixed(1) : '', '']} />
                    <Bar dataKey="value" radius={4}>
                      {barData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {plan && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Optimized transformation plan</h3>
              <p className="text-xs text-zinc-500 mb-2">
                Goal: {plan.goal.type} → {plan.goal.target_value} in {plan.total_duration_months} months (confidence {Math.round(plan.confidence_score * 100)}%)
              </p>
              <ul className="list-decimal list-inside space-y-2 text-sm text-zinc-700 mb-4">
                {plan.actions.map((a) => (
                  <li key={a.order}>
                    {a.intervention.description ?? a.intervention.target} (months {a.start_month}–{a.end_month ?? a.start_month + (a.intervention.duration_months ?? 12)})
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-medium text-zinc-600 mb-1">Trade-offs</p>
                  <ul className="list-disc list-inside text-zinc-500">{plan.trade_offs.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </div>
                <div>
                  <p className="font-medium text-zinc-600 mb-1">Risks</p>
                  <ul className="list-disc list-inside text-zinc-500">{plan.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {loading && <p className="text-sm text-zinc-500">Loading…</p>}
    </div>
  );
}
