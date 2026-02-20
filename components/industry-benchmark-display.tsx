'use client';

import { useState, useEffect } from 'react';
import type { IndustryBenchmarkReport, ComparisonMetric } from '@/lib/industry-benchmark-types';

function comparisonClass(c: string): string {
  if (c === 'Above average') return 'bg-emerald-100 text-emerald-800';
  if (c === 'Below average') return 'bg-red-100 text-red-800';
  return 'bg-zinc-100 text-zinc-800';
}

function BarPair({ label, metric }: { label: string; metric: ComparisonMetric }) {
  const scale = 100;
  const orgH = (metric.organisation_score / scale) * 96;
  const indH = (metric.industry_average / scale) * 96;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${comparisonClass(metric.comparison)}`}>
          {metric.comparison}
          {metric.pct_diff !== 0 && (
            <span className="ml-1">
              {metric.pct_diff > 0 ? '+' : ''}{metric.pct_diff.toFixed(1)}%
            </span>
          )}
        </span>
      </div>
      <div className="flex gap-4 items-end h-28">
        <div className="flex-1 flex flex-col justify-end items-center">
          <div
            className="w-full max-w-[60px] bg-indigo-500 rounded-t transition-all"
            style={{ height: `${Math.max(4, orgH)}px` }}
          />
          <p className="text-xs text-zinc-500 mt-1">You: {metric.organisation_score.toFixed(0)}</p>
        </div>
        <div className="flex-1 flex flex-col justify-end items-center">
          <div
            className="w-full max-w-[60px] bg-zinc-300 rounded-t transition-all"
            style={{ height: `${Math.max(4, indH)}px` }}
          />
          <p className="text-xs text-zinc-500 mt-1">Industry: {metric.industry_average.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
}

export function IndustryBenchmarkDisplay({ organisationId }: { organisationId: string }) {
  const [report, setReport] = useState<IndustryBenchmarkReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/organisations/${organisationId}/industry-benchmarks`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load benchmarks');
        return r.json();
      })
      .then((data) => {
        setReport({
          organisation_id: data.organisation_id,
          industry_used: data.industry_used,
          data: data.data,
          ai: data.ai,
          strengths: data.strengths ?? [],
          weaknesses: data.weaknesses ?? [],
          generated_at: data.generated_at,
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [organisationId]);

  if (loading) return <div className="py-12 text-center text-zinc-500">Loading benchmark comparison…</div>;
  if (error || !report) return <div className="glass-card p-8 text-center text-red-600">{error || 'No data'}</div>;

  return (
    <div className="space-y-8">
      <div className="glass-card p-4 text-sm text-zinc-600">
        Comparing to industry: <strong className="text-zinc-800">{report.industry_used}</strong>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Data maturity vs industry</h3>
          <BarPair label="Data maturity index" metric={report.data} />
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">AI maturity vs industry</h3>
          <BarPair label="AI maturity score" metric={report.ai} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {report.strengths.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-emerald-800 mb-2">Strengths</h3>
            <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1">
              {report.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {report.weaknesses.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Areas to improve</h3>
            <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1">
              {report.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {report.generated_at && (
        <p className="text-xs text-zinc-400">Generated {new Date(report.generated_at).toLocaleString()}</p>
      )}
    </div>
  );
}
