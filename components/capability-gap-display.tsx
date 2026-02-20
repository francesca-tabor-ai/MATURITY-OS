'use client';

import type { CapabilityGapResult, GapDimension } from '@/lib/capability-gap-types';

export interface CapabilityGapDisplayProps {
  gaps: CapabilityGapResult[];
  analysis_date?: string;
  inputs_summary?: {
    data_maturity_stage: number;
    data_maturity_index: number;
    ai_maturity_stage: number;
    ai_maturity_score: number;
  };
  dimension_scores?: { dimension: GapDimension; current: number; ideal: number }[];
}

const DIMENSION_LABELS: Record<GapDimension, string> = {
  data_collection: 'Data collection',
  data_storage: 'Data storage',
  data_integration: 'Data integration',
  data_governance: 'Data governance',
  data_accessibility: 'Data accessibility',
  automation: 'Automation',
  ai_usage: 'AI usage',
  deployment: 'Deployment',
};

function priorityClass(level: string): string {
  if (level === 'High') return 'bg-red-100 text-red-800 border-red-200';
  if (level === 'Medium') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-zinc-100 text-zinc-700 border-zinc-200';
}

/** Simple radar: polygon of dimension scores (current) vs ideal (100) outline. */
function RadarChart({
  dimension_scores,
}: {
  dimension_scores: { dimension: GapDimension; current: number; ideal: number }[];
}) {
  const n = dimension_scores.length;
  if (n === 0) return null;
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const points = dimension_scores.map((d, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const r = (d.current / 100) * radius;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });
  const idealPoints = dimension_scores.map((d, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const r = radius;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  });
  const toPath = (pts: number[][]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-zinc-900 mb-4">Current vs ideal capability (by dimension)</h3>
      <div className="flex flex-wrap items-center gap-6">
        <svg viewBox="0 0 200 200" className="w-52 h-52 flex-shrink-0">
          {/* Grid circles */}
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={radius * r}
              fill="none"
              stroke="rgb(228 228 231)"
              strokeWidth="0.5"
            />
          ))}
          {/* Axis lines */}
          {dimension_scores.map((_, i) => {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="rgb(228 228 231)"
                strokeWidth="0.5"
              />
            );
          })}
          {/* Ideal (outer) */}
          <path
            d={toPath(idealPoints)}
            fill="none"
            stroke="rgb(203 213 225)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          {/* Current (filled) */}
          <path
            d={toPath(points)}
            fill="rgba(99, 102, 241, 0.2)"
            stroke="rgb(99, 102, 241)"
            strokeWidth="2"
          />
        </svg>
        <ul className="text-sm text-zinc-600 space-y-1">
          {dimension_scores.map((d) => (
            <li key={d.dimension}>
              <span className="font-medium text-zinc-800">{DIMENSION_LABELS[d.dimension]}</span>
              {' '}
              <span className="text-indigo-600">{d.current.toFixed(0)}</span>
              {' / 100'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CapabilityGapDisplay({
  gaps,
  analysis_date,
  inputs_summary,
  dimension_scores,
}: CapabilityGapDisplayProps) {
  const byTheme = gaps.reduce((acc, g) => {
    const t = g.grouped_theme;
    if (!acc[t]) acc[t] = [];
    acc[t].push(g);
    return acc;
  }, {} as Record<string, CapabilityGapResult[]>);

  return (
    <div className="space-y-8">
      {inputs_summary && (
        <div className="glass-card p-4 text-sm text-zinc-600">
          Data maturity: stage {inputs_summary.data_maturity_stage}, index {inputs_summary.data_maturity_index}
          {' · '}
          AI maturity: stage {inputs_summary.ai_maturity_stage}, score {inputs_summary.ai_maturity_score}
        </div>
      )}

      {dimension_scores && dimension_scores.length > 0 && (
        <RadarChart dimension_scores={dimension_scores} />
      )}

      <div className="glass-card overflow-hidden">
        <h3 className="px-4 py-3 font-semibold text-zinc-900 bg-zinc-50 border-b border-zinc-200">
          Identified gaps by theme ({gaps.length})
        </h3>
        <div className="divide-y divide-zinc-100">
          {Object.entries(byTheme).map(([theme, themeGaps]) => (
            <div key={theme} className="p-4">
              <h4 className="text-sm font-medium text-zinc-700 mb-2">{theme}</h4>
              <ul className="space-y-2">
                {themeGaps.map((gap) => (
                  <li
                    key={gap.id}
                    className="flex flex-wrap items-center gap-2 text-sm"
                  >
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${priorityClass(gap.priority_level)}`}
                    >
                      {gap.priority_level}
                    </span>
                    <span className="text-zinc-800">{gap.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tag cloud style: all gaps as pills */}
      <div className="flex flex-wrap gap-2">
        {gaps.map((gap) => (
          <span
            key={gap.id}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${priorityClass(gap.priority_level)}`}
            title={gap.grouped_theme}
          >
            {gap.description}
          </span>
        ))}
      </div>

      {analysis_date && (
        <p className="text-xs text-zinc-400">
          Analysis run {new Date(analysis_date).toLocaleString()}
        </p>
      )}
    </div>
  );
}
