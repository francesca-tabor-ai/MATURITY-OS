'use client';

import { useState, useEffect } from 'react';
import { RoadmapForm } from '@/components/roadmap-form';
import { RoadmapDisplay } from '@/components/roadmap-display';
import type { TransformationRoadmap } from '@/lib/roadmap-types';

interface RoadmapRow {
  id: string;
  generation_date: string;
  roadmap: TransformationRoadmap;
  inputs?: Record<string, unknown>;
}

export function RoadmapPageClient({ organisationId }: { organisationId: string }) {
  const [lastResult, setLastResult] = useState<RoadmapRow | null>(null);
  const [history, setHistory] = useState<RoadmapRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/organisations/${organisationId}/roadmap`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
          if (data.length > 0 && !selectedId) {
            setLastResult(data[0]);
            setSelectedId(data[0].id);
          }
        }
      })
      .catch(() => {});
  }, [organisationId]);

  function handleSuccess(result: Record<string, unknown>) {
    const row: RoadmapRow = {
      id: result.id as string,
      generation_date: (result.generation_date ?? result.generated_at) as string,
      roadmap: result as unknown as TransformationRoadmap,
    };
    setLastResult(row);
    setHistory((prev) => [row, ...prev]);
    setSelectedId(row.id);
  }

  const displayRoadmap = selectedId
    ? history.find((r) => r.id === selectedId) ?? lastResult
    : lastResult;

  return (
    <div className="space-y-8">
      <RoadmapForm organisationId={organisationId} onSuccess={handleSuccess} />

      {displayRoadmap?.roadmap && (
        <>
          <RoadmapDisplay
            roadmap={displayRoadmap.roadmap}
            generation_date={displayRoadmap.generation_date}
            id={displayRoadmap.id}
          />
          {history.length > 1 && (
            <div className="glass-card overflow-hidden">
              <h3 className="px-4 py-3 text-sm font-medium text-zinc-700 bg-zinc-50 border-b border-zinc-200">
                Previous roadmaps
              </h3>
              <ul className="divide-y divide-zinc-100">
                {history.slice(0, 10).map((r) => (
                  <li key={r.id} className="px-4 py-2 flex justify-between items-center text-sm">
                    <span className="text-zinc-600">
                      {r.generation_date ? new Date(r.generation_date).toLocaleString() : '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className={`font-medium ${selectedId === r.id ? 'text-indigo-600' : 'text-zinc-900 hover:text-indigo-600'}`}
                    >
                      {r.roadmap.phases?.length ?? 0} phases · {r.roadmap.total_projected_impact_label ?? '—'} impact
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
