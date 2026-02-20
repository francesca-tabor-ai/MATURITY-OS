'use client';

import { useState, useEffect } from 'react';
import { CapabilityGapForm } from '@/components/capability-gap-form';
import { CapabilityGapDisplay } from '@/components/capability-gap-display';
import type { CapabilityGapResult, GapDimension } from '@/lib/capability-gap-types';

interface GapRow {
  id: string;
  analysis_date: string;
  gap_description: string;
  priority_level: string;
  grouped_theme: string;
  dimension: string | null;
}

export function CapabilityGapPageClient({ organisationId }: { organisationId: string }) {
  const [lastResult, setLastResult] = useState<{
    gaps: CapabilityGapResult[];
    analysis_date?: string;
    inputs_summary?: {
      data_maturity_stage: number;
      data_maturity_index: number;
      ai_maturity_stage: number;
      ai_maturity_score: number;
    };
    dimension_scores?: { dimension: GapDimension; current: number; ideal: number }[];
  } | null>(null);
  const [history, setHistory] = useState<{ analysis_date: string; gaps: CapabilityGapResult[] }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/organisations/${organisationId}/capability-gaps?limit=200`)
      .then((r) => r.json())
      .then((rows: GapRow[]) => {
        if (!Array.isArray(rows)) return;
        const byDate = rows.reduce((acc, r) => {
          const d = r.analysis_date;
          if (!acc[d]) acc[d] = [];
          acc[d].push({
            id: r.id,
            description: r.gap_description,
            dimension: (r.dimension ?? 'data_governance') as GapDimension,
            priority_level: r.priority_level as CapabilityGapResult['priority_level'],
            grouped_theme: r.grouped_theme,
          });
          return acc;
        }, {} as Record<string, CapabilityGapResult[]>);
        const sorted = Object.entries(byDate)
          .map(([analysis_date, gaps]) => ({ analysis_date, gaps }))
          .sort((a, b) => new Date(b.analysis_date).getTime() - new Date(a.analysis_date).getTime());
        setHistory(sorted);
        if (sorted.length > 0) setSelectedDate(sorted[0].analysis_date);
      })
      .catch(() => {});
  }, [organisationId]);

  function handleSuccess(result: Record<string, unknown>) {
    const gaps = (result.gaps as CapabilityGapResult[]) ?? [];
    const analysis_date = result.analysis_date as string | undefined;
    const inputs_summary = result.inputs_summary as {
      data_maturity_stage: number;
      data_maturity_index: number;
      ai_maturity_stage: number;
      ai_maturity_score: number;
    } | undefined;
    const dimension_scores = result.dimension_scores as { dimension: GapDimension; current: number; ideal: number }[] | undefined;
    setLastResult({
      gaps,
      analysis_date,
      inputs_summary,
      dimension_scores,
    });
    setHistory((prev) => {
      const next = [{ analysis_date: analysis_date ?? new Date().toISOString(), gaps }, ...prev.filter((h) => h.analysis_date !== analysis_date)];
      return next.slice(0, 20);
    });
    setSelectedDate(analysis_date ?? null);
  }

  const displayGaps = selectedDate
    ? lastResult?.analysis_date === selectedDate
      ? lastResult.gaps
      : history.find((h) => h.analysis_date === selectedDate)?.gaps ?? []
    : lastResult?.gaps ?? history[0]?.gaps ?? [];

  const isShowingLastResult = lastResult != null && selectedDate === lastResult.analysis_date;

  return (
    <div className="space-y-8">
      <CapabilityGapForm organisationId={organisationId} onSuccess={handleSuccess} />

      {displayGaps.length > 0 && (
        <>
          <CapabilityGapDisplay
            gaps={displayGaps}
            analysis_date={selectedDate ?? lastResult?.analysis_date}
            inputs_summary={isShowingLastResult ? lastResult.inputs_summary : undefined}
            dimension_scores={isShowingLastResult ? lastResult.dimension_scores : undefined}
          />
          {history.length > 1 && (
            <div className="glass-card overflow-hidden">
              <h3 className="px-4 py-3 text-sm font-medium text-zinc-700 bg-zinc-50 border-b border-zinc-200">
                Previous analyses
              </h3>
              <ul className="divide-y divide-zinc-100">
                {history.slice(0, 10).map((h) => (
                  <li key={h.analysis_date} className="px-4 py-2 flex justify-between items-center text-sm">
                    <span className="text-zinc-600">{new Date(h.analysis_date).toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(h.analysis_date)}
                      className={`font-medium ${selectedDate === h.analysis_date ? 'text-indigo-600' : 'text-zinc-900 hover:text-indigo-600'}`}
                    >
                      {h.gaps.length} gaps
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
