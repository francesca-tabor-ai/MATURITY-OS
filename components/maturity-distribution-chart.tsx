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
import type { DistributionStats, MaturityDistributionAnalysis } from '@/lib/maturity-distribution-types';

const BIN_SIZE = 10;
const BINS = Array.from({ length: 10 }, (_, i) => ({
  min: i * BIN_SIZE,
  max: (i + 1) * BIN_SIZE,
  label: `${i * BIN_SIZE}-${(i + 1) * BIN_SIZE}`,
}));

function scoresToHistogram(scores: number[]): { bin: string; count: number; range: string }[] {
  const counts = BINS.map(() => 0);
  for (const s of scores) {
    const i = Math.min(Math.floor(s / BIN_SIZE), BINS.length - 1);
    counts[i]++;
  }
  return BINS.map((b, i) => ({
    bin: b.label,
    count: counts[i],
    range: b.label,
  }));
}

function StatsCard({ label, stats }: { label: string; stats: DistributionStats }) {
  if (stats.count === 0) {
    return (
      <div className="glass-card p-4">
        <h4 className="text-sm font-semibold text-zinc-700 mb-2">{label}</h4>
        <p className="text-zinc-500 text-sm">No data</p>
      </div>
    );
  }
  return (
    <div className="glass-card p-4">
      <h4 className="text-sm font-semibold text-zinc-700 mb-2">{label}</h4>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-zinc-500">Mean</dt>
        <dd className="font-medium">{stats.mean.toFixed(1)}</dd>
        <dt className="text-zinc-500">Median</dt>
        <dd className="font-medium">{stats.median.toFixed(1)}</dd>
        <dt className="text-zinc-500">Std dev</dt>
        <dd className="font-medium">{stats.std_dev.toFixed(1)}</dd>
        <dt className="text-zinc-500">Q1 / Q3</dt>
        <dd className="font-medium">{stats.q1.toFixed(0)} / {stats.q3.toFixed(0)}</dd>
        <dt className="text-zinc-500">Range</dt>
        <dd className="font-medium">{stats.min.toFixed(0)} – {stats.max.toFixed(0)}</dd>
        <dt className="text-zinc-500">n</dt>
        <dd className="font-medium">{stats.count}</dd>
      </dl>
      {stats.outliers && stats.outliers.length > 0 && (
        <p className="mt-2 text-xs text-amber-600">Outliers: {stats.outliers.length}</p>
      )}
    </div>
  );
}

export function MaturityDistributionChart() {
  const [industry, setIndustry] = useState<string>('');
  const [data, setData] = useState<{
    aggregated: { data_scores: number[]; ai_scores: number[]; industry_filter: string | null };
    analysis: MaturityDistributionAnalysis;
    industries: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = industry ? `?industry=${encodeURIComponent(industry)}` : '';
    fetch(`/api/maturity-distribution${params}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [industry]);

  if (loading && !data) return <div className="py-12 text-center text-zinc-500">Loading distribution…</div>;
  if (error) return <div className="glass-card p-8 text-center text-red-600">{error}</div>;
  if (!data) return null;

  const { aggregated, analysis, industries } = data;
  const dataHistogram = scoresToHistogram(aggregated.data_scores);
  const aiHistogram = scoresToHistogram(aggregated.ai_scores);

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
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
        {aggregated.industry_filter && (
          <span className="text-sm text-zinc-500">
            Showing {aggregated.data_scores.length} orgs in “{aggregated.industry_filter}”
          </span>
        )}
      </div>

      {aggregated.data_scores.length === 0 && aggregated.ai_scores.length === 0 ? (
        <div className="glass-card p-8 text-center text-zinc-500">
          No maturity data in this portfolio yet. Run Data and AI audits for your organisations.
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Data maturity distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataHistogram} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="rgb(99 102 241)" radius={[4, 4, 0, 0]}>
                      {dataHistogram.map((_, i) => (
                        <Cell key={i} fill="rgb(99 102 241)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <StatsCard label="Statistics" stats={analysis.data} />
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">AI maturity distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={aiHistogram} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis dataKey="bin" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="rgb(16 185 129)" radius={[4, 4, 0, 0]}>
                      {aiHistogram.map((_, i) => (
                        <Cell key={i} fill="rgb(16 185 129)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <StatsCard label="Statistics" stats={analysis.ai} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
