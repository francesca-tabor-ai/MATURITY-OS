'use client';

import type { TransformationRoadmap, RoadmapPhase, RoadmapAction } from '@/lib/roadmap-types';

function formatCurrency(n: number): string {
  if (n >= 1e9) return `£${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `£${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `£${(n / 1e3).toFixed(2)}K`;
  return `£${n.toFixed(0)}`;
}

export interface RoadmapDisplayProps {
  roadmap: TransformationRoadmap;
  generation_date?: string;
  id?: string;
}

export function RoadmapDisplay({ roadmap, generation_date, id }: RoadmapDisplayProps) {
  const { phases, total_estimated_cost, total_projected_impact, total_projected_impact_label, inputs_summary } = roadmap;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-6">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Total estimated cost</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{formatCurrency(total_estimated_cost)}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Total projected impact</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {total_projected_impact_label ?? formatCurrency(total_projected_impact)}
          </p>
        </div>
      </div>

      {inputs_summary && (
        <div className="glass-card p-4 text-sm text-zinc-600">
          <span>Current: Data {inputs_summary.current_data_maturity} / AI {inputs_summary.current_ai_maturity}</span>
          <span className="mx-2">→</span>
          <span>Target: Data {inputs_summary.target_data_maturity} / AI {inputs_summary.target_ai_maturity}</span>
          <span className="ml-2">· {inputs_summary.prioritization.replace(/_/g, ' ')}</span>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="font-semibold text-zinc-900">Phased roadmap</h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-200 hidden sm:block" aria-hidden />
          <div className="space-y-8">
            {phases.map((phase, pi) => (
              <PhaseCard key={phase.id} phase={phase} index={pi} formatCurrency={formatCurrency} />
            ))}
          </div>
        </div>
      </div>

      {generation_date && (
        <p className="text-xs text-zinc-400">
          Generated {new Date(generation_date).toLocaleString()}
          {id && ` · ID ${id.slice(0, 8)}`}
        </p>
      )}
    </div>
  );
}

function PhaseCard({
  phase,
  index,
  formatCurrency,
}: {
  phase: RoadmapPhase;
  index: number;
  formatCurrency: (n: number) => string;
}) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-start gap-4 p-6">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold hidden sm:flex"
          aria-hidden
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-zinc-900">{phase.name}</h4>
          {phase.description && (
            <p className="text-sm text-zinc-600 mt-1">{phase.description}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <span className="text-zinc-700">Cost: <strong>{formatCurrency(phase.estimated_cost)}</strong></span>
            <span className="text-emerald-700">Impact: <strong>{phase.projected_impact_label ?? formatCurrency(phase.projected_impact_value)}</strong></span>
          </div>
          <ul className="mt-4 space-y-2">
            {phase.actions.map((action) => (
              <ActionItem key={action.id} action={action} formatCurrency={formatCurrency} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ActionItem({
  action,
  formatCurrency,
}: {
  action: RoadmapAction;
  formatCurrency: (n: number) => string;
}) {
  return (
    <li className="flex flex-wrap items-baseline gap-2 text-sm border-l-2 border-zinc-100 pl-3 py-1">
      <span className="text-zinc-800">{action.description}</span>
      <span className="text-zinc-500">
        {formatCurrency(action.estimated_cost)}
        {action.projected_impact_label && (
          <span className="text-emerald-600 ml-1">→ {action.projected_impact_label}</span>
        )}
      </span>
    </li>
  );
}
