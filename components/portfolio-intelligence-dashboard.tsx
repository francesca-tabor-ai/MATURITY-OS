'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Link from 'next/link';
import type { PortfolioIntelligenceData, PortfolioPerformance } from '@/lib/portfolio-intelligence-types';

interface DistributionPayload {
  data_histogram: { bin: string; count: number }[];
  ai_histogram: { bin: string; count: number }[];
  data_stats: { mean: number; median: number; count: number };
  ai_stats: { mean: number; median: number; count: number };
}

function formatCurrency(n: number): string {
  if (n >= 1e9) return `£${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `£${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `£${(n / 1e3).toFixed(2)}K`;
  return `£${Math.round(n)}`;
}

function riskColor(level: string | null): string {
  if (!level) return 'bg-zinc-200';
  switch (level.toUpperCase()) {
    case 'LOW': return 'bg-emerald-500';
    case 'MEDIUM': return 'bg-amber-500';
    case 'HIGH': return 'bg-red-500';
    default: return 'bg-zinc-300';
  }
}

function riskBg(level: string | null): string {
  if (!level) return 'bg-zinc-50 border-zinc-200';
  switch (level.toUpperCase()) {
    case 'LOW': return 'bg-emerald-50 border-emerald-200';
    case 'MEDIUM': return 'bg-amber-50 border-amber-200';
    case 'HIGH': return 'bg-red-50 border-red-200';
    default: return 'bg-zinc-50 border-zinc-200';
  }
}

interface ApiResponse {
  data: PortfolioIntelligenceData;
  performance: PortfolioPerformance;
  distribution: DistributionPayload;
}

export function PortfolioIntelligenceDashboard() {
  const [industry, setIndustry] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = industry ? `?industry=${encodeURIComponent(industry)}` : '';
    fetch(`/api/portfolio-intelligence${params}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load portfolio data');
        return r.json();
      })
      .then(setResponse)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [industry]);

  if (loading && !response) {
    return <div className="py-12 text-center text-zinc-500">Loading portfolio intelligence…</div>;
  }
  if (error) {
    return (
      <div className="glass-card p-8 text-center text-red-600">
        {error}
      </div>
    );
  }
  if (!response) return null;

  const { data, performance, distribution } = response;
  const { data_histogram, ai_histogram, data_stats, ai_stats } = distribution;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-zinc-700">Filter by industry</label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="input-field max-w-[200px]"
        >
          <option value="">All (portfolio)</option>
          {data.industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
        {data.industry_filter && (
          <span className="text-sm text-zinc-500">
            Showing {data.companies.length} companies in “{data.industry_filter}”
          </span>
        )}
      </div>

      {data.companies.length === 0 ? (
        <div className="glass-card p-8 text-center text-zinc-500">
          No organisations in this portfolio. Add organisations to see intelligence here.
        </div>
      ) : (
        <>
          {/* Portfolio-level KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-card p-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Companies</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">{performance.company_count}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Avg data / AI maturity</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">
                {performance.avg_data_maturity.toFixed(0)} / {performance.avg_ai_maturity.toFixed(0)}
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Total revenue upside</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {formatCurrency(performance.total_revenue_upside)}
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Total valuation upside</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">
                {formatCurrency(performance.total_valuation_upside)}
              </p>
            </div>
          </div>

          {/* Value creation */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Value creation opportunities</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs text-zinc-500">Revenue upside</p>
                <p className="text-xl font-semibold text-zinc-900">{formatCurrency(performance.total_revenue_upside)}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs text-zinc-500">Profit expansion</p>
                <p className="text-xl font-semibold text-zinc-900">{formatCurrency(performance.total_profit_expansion)}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs text-zinc-500">Cost reduction</p>
                <p className="text-xl font-semibold text-zinc-900">{formatCurrency(performance.total_cost_reduction)}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-600">
              Total financial impact: <strong>{formatCurrency(performance.total_financial_impact)}</strong>
            </p>
          </div>

          {/* Maturity distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Portfolio data maturity distribution</h3>
              {data_stats.count === 0 ? (
                <p className="text-zinc-500 text-sm py-8 text-center">No data maturity scores yet</p>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data_histogram} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="rgb(99 102 241)" radius={[4, 4, 0, 0]}>
                          {data_histogram.map((_, i) => (
                            <Cell key={i} fill="rgb(99 102 241)" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Mean {data_stats.mean.toFixed(1)} · Median {data_stats.median.toFixed(0)} · n={data_stats.count}
                  </p>
                </>
              )}
            </div>
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Portfolio AI maturity distribution</h3>
              {ai_stats.count === 0 ? (
                <p className="text-zinc-500 text-sm py-8 text-center">No AI maturity scores yet</p>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ai_histogram} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="rgb(16 185 129)" radius={[4, 4, 0, 0]}>
                          {ai_histogram.map((_, i) => (
                            <Cell key={i} fill="rgb(16 185 129)" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Mean {ai_stats.mean.toFixed(1)} · Median {ai_stats.median.toFixed(0)} · n={ai_stats.count}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Risk exposure heatmap */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Portfolio risk exposure</h3>
            <p className="text-xs text-zinc-500 mb-4">Avg risk score: {performance.avg_risk_score.toFixed(1)} (0–100)</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.companies.map((c) => (
                <Link
                  key={c.organisation_id}
                  href={`/dashboard/organisations/${c.organisation_id}/risk-assessment`}
                  className={`block rounded-lg border p-3 transition hover:shadow ${riskBg(c.risk_level)}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-zinc-900 truncate">{c.name}</span>
                    <span className={`inline-block h-3 w-3 rounded-full shrink-0 ${riskColor(c.risk_level)}`} title={c.risk_level ?? 'No assessment'} />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {c.overall_risk_score != null ? `Score ${c.overall_risk_score.toFixed(0)}` : 'No risk data'}
                    {c.industry ? ` · ${c.industry}` : ''}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Top / bottom performers */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Top by valuation upside</h3>
              <ul className="space-y-2">
                {performance.top_by_valuation_upside.length === 0 ? (
                  <li className="text-sm text-zinc-500">No valuation data yet</li>
                ) : (
                  performance.top_by_valuation_upside.map((c) => (
                    <li key={c.organisation_id}>
                      <Link href={`/dashboard/organisations/${c.organisation_id}/valuation-adjustment`} className="text-indigo-600 hover:underline text-sm font-medium">
                        {c.name}
                      </Link>
                      <span className="text-zinc-600 text-sm ml-1">
                        {c.valuation_upside_pct != null ? `+${c.valuation_upside_pct.toFixed(1)}%` : formatCurrency(c.valuation_upside ?? 0)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Top by revenue upside</h3>
              <ul className="space-y-2">
                {performance.top_by_revenue_upside.length === 0 ? (
                  <li className="text-sm text-zinc-500">No financial impact data yet</li>
                ) : (
                  performance.top_by_revenue_upside.map((c) => (
                    <li key={c.organisation_id}>
                      <Link href={`/dashboard/organisations/${c.organisation_id}/financial-impact`} className="text-emerald-600 hover:underline text-sm font-medium">
                        {c.name}
                      </Link>
                      <span className="text-zinc-600 text-sm ml-1">{formatCurrency(c.revenue_upside ?? 0)}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Lowest maturity (focus)</h3>
              <ul className="space-y-2">
                {performance.bottom_by_maturity.length === 0 ? (
                  <li className="text-sm text-zinc-500">No maturity data yet</li>
                ) : (
                  performance.bottom_by_maturity.map((c) => {
                    const avg = ((c.data_maturity_index ?? 0) + (c.ai_maturity_score ?? 0)) / 2;
                    return (
                      <li key={c.organisation_id}>
                        <Link href={`/dashboard/organisations/${c.organisation_id}`} className="text-amber-600 hover:underline text-sm font-medium">
                          {c.name}
                        </Link>
                        <span className="text-zinc-600 text-sm ml-1">avg {avg.toFixed(0)}</span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
