'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AcquisitionTarget } from '@/lib/acquisition-scanner-types';

function formatCurrency(n: number): string {
  if (n >= 1e9) return `£${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `£${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `£${(n / 1e3).toFixed(2)}K`;
  return `£${Math.round(n)}`;
}

type SortKey = 'acquisition_attractiveness_score' | 'undervaluation_score' | 'current_valuation' | 'valuation_upside_pct' | 'name';

interface ApiResponse {
  targets: AcquisitionTarget[];
  industries: string[];
  filters_applied: Record<string, unknown>;
}

export function AcquisitionTargetDisplay() {
  const [industry, setIndustry] = useState('');
  const [minValuation, setMinValuation] = useState('');
  const [maxValuation, setMaxValuation] = useState('');
  const [minDataMaturity, setMinDataMaturity] = useState('');
  const [minAiMaturity, setMinAiMaturity] = useState('');
  const [saveResults, setSaveResults] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('acquisition_attractiveness_score');
  const [sortDesc, setSortDesc] = useState(true);

  const fetchTargets = () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (industry) params.set('industry', industry);
    if (minValuation) params.set('min_valuation', minValuation);
    if (maxValuation) params.set('max_valuation', maxValuation);
    if (minDataMaturity) params.set('min_data_maturity', minDataMaturity);
    if (minAiMaturity) params.set('min_ai_maturity', minAiMaturity);
    if (saveResults) params.set('save', 'true');
    fetch(`/api/acquisition-scanner?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load acquisition targets');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const targets = data?.targets ?? [];
  const sorted = [...targets].sort((a, b) => {
    let va: number | string = (a as unknown as Record<string, unknown>)[sortKey] as number | string;
    let vb: number | string = (b as unknown as Record<string, unknown>)[sortKey] as number | string;
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDesc ? 1 : -1;
    if (va > vb) return sortDesc ? -1 : 1;
    return 0;
  });

  const th = (key: SortKey, label: string) => (
    <th
      className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900"
      onClick={() => {
        setSortKey(key);
        setSortDesc((prev) => (sortKey === key ? !prev : true));
      }}
    >
      {label} {sortKey === key ? (sortDesc ? '↓' : '↑') : ''}
    </th>
  );

  if (loading && !data) {
    return <div className="py-12 text-center text-zinc-500">Loading acquisition scanner…</div>;
  }
  if (error) {
    return (
      <div className="glass-card p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Filters</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="input-field w-48"
            >
              <option value="">All</option>
              {(data?.industries ?? []).map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Min valuation (£)</label>
            <input
              type="number"
              min={0}
              value={minValuation}
              onChange={(e) => setMinValuation(e.target.value)}
              className="input-field w-32"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Max valuation (£)</label>
            <input
              type="number"
              min={0}
              value={maxValuation}
              onChange={(e) => setMaxValuation(e.target.value)}
              className="input-field w-32"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Min data maturity</label>
            <input
              type="number"
              min={0}
              max={100}
              value={minDataMaturity}
              onChange={(e) => setMinDataMaturity(e.target.value)}
              className="input-field w-28"
              placeholder="0–100"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Min AI maturity</label>
            <input
              type="number"
              min={0}
              max={100}
              value={minAiMaturity}
              onChange={(e) => setMinAiMaturity(e.target.value)}
              className="input-field w-28"
              placeholder="0–100"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={saveResults}
              onChange={(e) => setSaveResults(e.target.checked)}
            />
            Save results to history
          </label>
          <button
            type="button"
            onClick={fetchTargets}
            className="btn-primary"
          >
            Run scan
          </button>
        </div>
      </div>

      {targets.length === 0 ? (
        <div className="glass-card p-8 text-center text-zinc-500">
          No acquisition targets found. Add organisations with valuation and maturity data, then run a scan.
        </div>
      ) : (
        <>
          <p className="text-sm text-zinc-600">
            {targets.length} target{targets.length !== 1 ? 's' : ''} — click column headers to sort.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  {th('name', 'Company')}
                  {th('acquisition_attractiveness_score', 'Attractiveness')}
                  {th('undervaluation_score', 'Undervaluation')}
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase">Valuation</th>
                  {th('valuation_upside_pct', 'Upside %')}
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase">Maturity</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase">Risk</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => (
                  <tr key={t.organisation_id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/dashboard/organisations/${t.organisation_id}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {t.name}
                      </Link>
                      {t.industry && <span className="text-zinc-500 text-xs block">{t.industry}</span>}
                    </td>
                    <td className="py-3 font-medium text-zinc-900">{t.acquisition_attractiveness_score.toFixed(1)}</td>
                    <td className="py-3 text-zinc-700">{t.undervaluation_score.toFixed(1)}</td>
                    <td className="py-3 text-zinc-700">
                      {formatCurrency(t.current_valuation)} → {formatCurrency(t.potential_valuation)}
                    </td>
                    <td className="py-3 text-emerald-600">+{t.valuation_upside_pct.toFixed(1)}%</td>
                    <td className="py-3 text-zinc-600">
                      D{t.data_maturity_index.toFixed(0)} / A{t.ai_maturity_score.toFixed(0)}
                    </td>
                    <td className="py-3">
                      <span
                        className={
                          t.risk_level === 'LOW'
                            ? 'text-emerald-600'
                            : t.risk_level === 'HIGH'
                              ? 'text-red-600'
                              : 'text-amber-600'
                        }
                      >
                        {t.risk_level ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
