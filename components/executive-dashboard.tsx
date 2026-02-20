'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ExecutiveDashboardData } from '@/lib/executive-dashboard-types';

function riskBarColor(score: number): string {
  if (score < 35) return 'bg-emerald-500';
  if (score < 65) return 'bg-amber-500';
  return 'bg-red-500';
}

function riskLevelClass(level: string): string {
  if (level === 'LOW') return 'bg-emerald-100 text-emerald-800';
  if (level === 'MEDIUM') return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function ExecutiveDashboard({ organisationId }: { organisationId: string }) {
  const [data, setData] = useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/organisations/${organisationId}/executive-dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load dashboard');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [organisationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-zinc-500">
        Loading dashboard…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="glass-card p-8 text-center text-red-600">
        {error || 'No data'}
      </div>
    );
  }

  const { maturity, classification, financial, roi, risk, roadmap } = data;

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-5 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Data Maturity Index</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {maturity?.data_maturity_index != null ? maturity.data_maturity_index.toFixed(0) : '—'}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">0–100</p>
        </div>
        <div className="glass-card p-5 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">AI Maturity Score</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {maturity?.ai_maturity_score != null ? maturity.ai_maturity_score.toFixed(0) : '—'}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">0–100</p>
        </div>
        <div className="glass-card p-5 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Financial impact (total)</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {financial?.total_formatted ?? '—'}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">Upside + margin + cost reduction</p>
        </div>
        <div className="glass-card p-5 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Overall risk score</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {risk?.overall_risk_score != null ? risk.overall_risk_score.toFixed(0) : '—'}
          </p>
          {risk?.risk_level && (
            <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded font-medium ${riskLevelClass(risk.risk_level)}`}>
              {risk.risk_level}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Maturity position (quadrant) */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Maturity position</h3>
          {classification ? (
            <>
              <p className="text-lg font-medium text-zinc-800 mb-2">{classification.classification_string}</p>
              <div className="relative w-full aspect-square max-w-xs bg-zinc-50 rounded-lg border border-zinc-200">
                <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                  <rect x="0" y="0" width="100" height="100" fill="transparent" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="rgb(228 228 231)" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="rgb(228 228 231)" strokeWidth="0.5" />
                  <circle
                    cx={Number(classification.matrix_x)}
                    cy={100 - Number(classification.matrix_y)}
                    r="4"
                    fill="rgb(99 102 241)"
                    stroke="white"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Data (X): {classification.matrix_x.toFixed(1)} · AI (Y): {classification.matrix_y.toFixed(1)}
                {classification.opportunity && ` · ${classification.opportunity}`}
              </p>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">Run Data & AI audits and Classification to see position.</p>
          )}
        </div>

        {/* Financial breakdown */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Financial upside</h3>
          {financial && financial.total_impact > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Revenue upside</span>
                <span className="font-medium text-emerald-600">{financial.revenue_upside_formatted}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${(financial.revenue_upside / financial.total_impact) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Margin expansion</span>
                <span className="font-medium text-blue-600">{financial.margin_formatted}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(financial.profit_margin_expansion_value / financial.total_impact) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Cost reduction</span>
                <span className="font-medium text-violet-600">{financial.cost_reduction_formatted}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${(financial.cost_reduction / financial.total_impact) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">Run Financial Impact to see upside.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk exposure */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Risk exposure</h3>
          {risk ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgb(228 228 231)"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={risk.overall_risk_score < 35 ? '#10b981' : risk.overall_risk_score < 65 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="2.5"
                      strokeDasharray={`${risk.overall_risk_score}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-zinc-900">
                    {risk.overall_risk_score}
                  </span>
                </div>
                <span className={`inline-flex px-3 py-1.5 rounded-lg font-medium ${riskLevelClass(risk.risk_level)}`}>
                  {risk.risk_level}
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'AI Misalignment', score: risk.ai_misalignment },
                  { label: 'Infrastructure', score: risk.infrastructure },
                  { label: 'Operational', score: risk.operational },
                  { label: 'Strategic', score: risk.strategic },
                ].map(({ label, score }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600 w-24">{label}</span>
                    <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${riskBarColor(score)}`}
                        style={{ width: `${Math.min(100, score)}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-6">{score}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">Run Risk Assessment to see exposure.</p>
          )}
        </div>

        {/* Transformation roadmap summary */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Transformation roadmap</h3>
          {roadmap && roadmap.phase_count > 0 ? (
            <>
              <div className="flex flex-wrap gap-4 mb-3">
                <span className="text-zinc-700">
                  <strong>{roadmap.phase_count}</strong> phases
                </span>
                <span className="text-zinc-700">Cost: <strong className="text-zinc-900">{roadmap.total_cost_formatted}</strong></span>
                <span className="text-emerald-700">Impact: <strong>{roadmap.total_impact_formatted}</strong></span>
              </div>
              <ul className="space-y-1 text-sm text-zinc-600">
                {roadmap.phases.slice(0, 4).map((p) => (
                  <li key={p.name}>{p.name}</li>
                ))}
              </ul>
              <Link
                href={`/dashboard/organisations/${organisationId}/roadmap`}
                className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                View full roadmap →
              </Link>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">Generate a Transformation Roadmap to see summary.</p>
          )}
        </div>
      </div>

      {/* ROI summary if present */}
      {roi && roi.total_investment > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-2">ROI & investment (latest)</h3>
          <p className="text-zinc-700">
            Total investment {roi.total_investment_formatted}
            {roi.expected_roi_pct != null && ` · ROI ${roi.expected_roi_pct.toFixed(0)}%`}
            {roi.payback_period_years != null && ` · Payback ${roi.payback_period_years.toFixed(1)} years`}
          </p>
        </div>
      )}
    </div>
  );
}
