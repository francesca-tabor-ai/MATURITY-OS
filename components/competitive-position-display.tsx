'use client';

import { useState, useEffect } from 'react';
import type { CompetitivePositionReport, CompetitorScore } from '@/lib/competitive-position-types';

function riskClass(level: string): string {
  if (level === 'Low') return 'bg-emerald-100 text-emerald-800';
  if (level === 'High') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
}

/** Speedometer-style gauge for advantage score 0-100 */
function AdvantageGauge({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const rotation = (pct / 100) * 180 - 90; // -90 to 90 deg for half circle
  return (
    <div className="relative w-36 h-24 flex items-end justify-center">
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <path
          d="M 10 70 A 50 50 0 0 1 110 70"
          fill="none"
          stroke="rgb(228 228 231)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 10 70 A 50 50 0 0 1 110 70"
          fill="none"
          stroke={score >= 60 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="157"
          strokeDashoffset={157 - (pct / 100) * 157}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl font-bold text-zinc-900">
        {score.toFixed(0)}
      </span>
    </div>
  );
}

/** 2D matrix: Data (X) vs AI (Y), org + competitors */
function CompetitiveMatrix({
  orgData,
  orgAi,
  competitors,
  orgName,
}: {
  orgData: number;
  orgAi: number;
  competitors: CompetitorScore[];
  orgName?: string;
}) {
  const points = [
    { x: orgData, y: orgAi, label: orgName ?? 'You', isOrg: true },
    ...competitors.map((c) => ({ x: c.data_maturity, y: c.ai_maturity, label: c.name ?? c.organisation_id.slice(0, 8), isOrg: false })),
  ];
  return (
    <div className="relative w-full aspect-square max-w-xs bg-zinc-50 rounded-lg border border-zinc-200 p-2">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgb(228 228 231)" strokeWidth="0.5" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="rgb(228 228 231)" strokeWidth="0.5" />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={100 - p.y}
              r={p.isOrg ? 5 : 3}
              fill={p.isOrg ? 'rgb(99 102 241)' : 'rgb(161 161 170)'}
              stroke="white"
              strokeWidth={p.isOrg ? 1.5 : 0.5}
            />
          </g>
        ))}
      </svg>
      <p className="text-xs text-zinc-500 mt-1 text-center">Data (X) · AI (Y) · Purple = you</p>
    </div>
  );
}

export function CompetitivePositionDisplay({ organisationId }: { organisationId: string }) {
  const [report, setReport] = useState<CompetitivePositionReport & { industries?: string[] } | null>(null);
  const [industryFilter, setIndustryFilter] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = industryFilter ? `?industry=${encodeURIComponent(industryFilter)}` : '';
    fetch(`/api/organisations/${organisationId}/competitive-position${params}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load competitive position');
        return r.json();
      })
      .then((data) => {
        setReport(data);
        if (data.industries?.length) setIndustries(data.industries);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [organisationId, industryFilter]);

  if (loading && !report) return <div className="py-12 text-center text-zinc-500">Loading competitive analysis…</div>;
  if (error && !report) return <div className="glass-card p-8 text-center text-red-600">{error}</div>;
  if (!report) return null;

  const rows = [
    {
      name: report.organisation_name ?? 'Your organisation',
      data: report.data_maturity,
      ai: report.ai_maturity,
      isOrg: true,
    },
    ...report.competitors.map((c) => ({
      name: c.name ?? c.organisation_id.slice(0, 8),
      data: c.data_maturity,
      ai: c.ai_maturity,
      isOrg: false,
    })),
  ];

  return (
    <div className="space-y-8">
      {industries.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-zinc-700">Compare within industry</label>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="input-field max-w-[200px]"
          >
            <option value="">All (portfolio)</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="glass-card p-6 text-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Competitive advantage score</p>
          <AdvantageGauge score={report.competitive_advantage_score} />
          <p className="text-xs text-zinc-500 mt-1">0–100</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-center items-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Competitive risk</p>
          <span className={`mt-3 inline-flex px-4 py-2 rounded-lg text-lg font-bold ${riskClass(report.competitive_risk_level)}`}>
            {report.competitive_risk_level}
          </span>
          <p className="text-xs text-zinc-500 mt-2">Risk score: {report.competitive_risk_score.toFixed(1)}</p>
        </div>
      </div>

      {report.competitors.length > 0 && (
        <>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Competitive matrix</h3>
            <CompetitiveMatrix
              orgData={report.data_maturity}
              orgAi={report.ai_maturity}
              competitors={report.competitors}
              orgName={report.organisation_name}
            />
          </div>
          <div className="glass-card overflow-hidden">
            <h3 className="px-4 py-3 text-sm font-semibold text-zinc-900 bg-zinc-50 border-b border-zinc-200">
              Maturity vs competitors
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left px-4 py-2 font-medium text-zinc-700">Organisation</th>
                    <th className="text-right px-4 py-2 font-medium text-zinc-700">Data maturity</th>
                    <th className="text-right px-4 py-2 font-medium text-zinc-700">AI maturity</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.name}
                      className={`border-b border-zinc-50 ${r.isOrg ? 'bg-indigo-50/50' : ''}`}
                    >
                      <td className="px-4 py-2 font-medium text-zinc-900">
                        {r.name}
                        {r.isOrg && <span className="ml-1 text-indigo-600">(you)</span>}
                      </td>
                      <td className="text-right px-4 py-2 text-zinc-700">{r.data.toFixed(0)}</td>
                      <td className="text-right px-4 py-2 text-zinc-700">{r.ai.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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
            <h3 className="text-sm font-semibold text-red-800 mb-2">Areas of concern</h3>
            <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1">
              {report.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {report.competitors.length === 0 && (
        <p className="text-sm text-zinc-500">
          Add more organisations to your portfolio (or set industry) to compare against competitors.
        </p>
      )}

      {report.generated_at && (
        <p className="text-xs text-zinc-400">Generated {new Date(report.generated_at).toLocaleString()}</p>
      )}
    </div>
  );
}

export function CompetitivePositionPageClient({ organisationId }: { organisationId: string }) {
  return <CompetitivePositionDisplay organisationId={organisationId} />;
}
