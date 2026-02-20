'use client';

import { STAGE_LABELS } from '@/lib/data-maturity-engine';

export interface DataMaturityResult {
  maturity_stage: number;
  confidence_score: number;
  maturity_index: number;
  collection_score?: number | null;
  storage_score?: number | null;
  integration_score?: number | null;
  governance_score?: number | null;
  accessibility_score?: number | null;
  details?: { stage_label?: string };
  created_at?: string;
}

const CATEGORIES = [
  { key: 'collection_score', label: 'Data Collection' },
  { key: 'storage_score', label: 'Data Storage' },
  { key: 'integration_score', label: 'Data Integration' },
  { key: 'governance_score', label: 'Data Governance' },
  { key: 'accessibility_score', label: 'Data Accessibility' },
] as const;

export function DataMaturityDashboard({ result }: { result: DataMaturityResult }) {
  const stage = result.maturity_stage ?? 1;
  const stageLabel = result.details?.stage_label ?? STAGE_LABELS[stage] ?? `Stage ${stage}`;
  const index = Math.round(result.maturity_index ?? 0);
  const confidence = Math.round((result.confidence_score ?? 0) * 100);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="glass-card p-6 text-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Maturity stage</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">{stage}</p>
          <p className="mt-1 text-zinc-600 text-sm">{stageLabel}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Maturity index</p>
          <div className="mt-2 flex items-center justify-center">
            <div className="relative w-28 h-28">
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
                  stroke="rgb(99 102 241)"
                  strokeWidth="2.5"
                  strokeDasharray={`${index}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-zinc-900">
                {index}
              </span>
            </div>
          </div>
          <p className="mt-1 text-zinc-600 text-sm">0–100</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Confidence score</p>
          <div className="mt-2 h-3 w-full max-w-[160px] mx-auto bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="mt-2 text-xl font-semibold text-zinc-900">{confidence}%</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-zinc-900 mb-4">Category scores</h3>
        <div className="space-y-4">
          {CATEGORIES.map(({ key, label }) => {
            const value = result[key as keyof DataMaturityResult];
            const num = typeof value === 'number' ? Math.round(value) : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-zinc-700">{label}</span>
                  <span className="text-zinc-500">{num}/100</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${num}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {result.created_at && (
        <p className="text-sm text-zinc-500">Calculated {new Date(result.created_at).toLocaleString()}</p>
      )}
    </div>
  );
}
