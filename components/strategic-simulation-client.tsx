'use client';

import { useState } from 'react';
import { ScenarioBuilder } from './scenario-builder';
import { ScenarioComparisonDisplay } from './scenario-comparison-display';
import type { ScenarioParameters } from '@/lib/strategic-simulation-types';
import type { SimulationOutcome, OutcomeAnalysis } from '@/lib/strategic-simulation-types';

export function StrategicSimulationClient({ organisationId }: { organisationId: string }) {
  const [outcomes, setOutcomes] = useState<SimulationOutcome[]>([]);
  const [analysis, setAnalysis] = useState<OutcomeAnalysis | null>(null);
  const [running, setRunning] = useState(false);
  const [saveResults, setSaveResults] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleRun = (scenarios: { name: string; parameters: ScenarioParameters }[]) => {
    setRunning(true);
    fetch(`/api/organisations/${organisationId}/strategic-simulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarios, save: saveResults }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok) {
          setOutcomes(data.outcomes ?? []);
          setAnalysis(data.analysis ?? null);
          setSelectedIndices((data.outcomes ?? []).map((_: unknown, i: number) => i));
        }
      })
      .finally(() => setRunning(false));
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Scenario builder</h2>
        <ScenarioBuilder organisationId={organisationId} onRun={handleRun} running={running} />
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input type="checkbox" checked={saveResults} onChange={(e) => setSaveResults(e.target.checked)} />
            Save results to history
          </label>
        </div>
      </div>

      {outcomes.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-zinc-600">Compare scenarios:</span>
            {outcomes.map((o, i) => (
              <label key={i} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedIndices.includes(i)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIndices((s) => [...s, i].sort((a, b) => a - b));
                    else setSelectedIndices((s) => s.filter((x) => x !== i));
                  }}
                />
                {o.scenario_name}
              </label>
            ))}
          </div>
          <ScenarioComparisonDisplay outcomes={outcomes} analysis={analysis} selectedIndices={selectedIndices} />
        </>
      )}
    </div>
  );
}
