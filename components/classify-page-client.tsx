'use client';

import { useState, useEffect } from 'react';
import { MaturityClassificationDisplay } from '@/components/maturity-classification-display';
import { MaturityMatrixViz } from '@/components/maturity-matrix-viz';

export function ClassifyPageClient({ organisationId }: { organisationId: string }) {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useLatest, setUseLatest] = useState(true);
  const [manualData, setManualData] = useState({ data_maturity_index: 50, ai_maturity_score: 50 });

  useEffect(() => {
    fetch(`/api/organisations/${organisationId}/classify`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(() => {});
  }, [organisationId]);

  async function runClassification() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/organisations/${organisationId}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: useLatest ? '{}' : JSON.stringify(manualData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Classification failed');
      setResult(data);
      setHistory((prev) => [data, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
    setLoading(false);
  }

  const displayResult = result ?? (history[0] as Record<string, unknown> | undefined);

  return (
    <div className="space-y-8">
      <div className="glass-card p-6">
        <h3 className="font-semibold text-zinc-900 mb-4">Run classification</h3>
        <p className="text-sm text-zinc-600 mb-4">
          Use your latest Data Maturity and AI Maturity audit results, or enter scores manually.
        </p>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="radio"
            checked={useLatest}
            onChange={() => setUseLatest(true)}
          />
          Use latest audit results
        </label>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="radio"
            checked={!useLatest}
            onChange={() => setUseLatest(false)}
          />
          Enter scores manually
        </label>
        {!useLatest && (
          <div className="flex gap-4 mb-4">
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Data Maturity Index (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={manualData.data_maturity_index}
                onChange={(e) => setManualData((p) => ({ ...p, data_maturity_index: Number(e.target.value) || 0 }))}
                className="input-field w-24"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">AI Maturity Score (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={manualData.ai_maturity_score}
                onChange={(e) => setManualData((p) => ({ ...p, ai_maturity_score: Number(e.target.value) || 0 }))}
                className="input-field w-24"
              />
            </div>
          </div>
        )}
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
        <button type="button" onClick={runClassification} disabled={loading} className="btn-primary">
          {loading ? 'Classifying…' : 'Classify maturity'}
        </button>
      </div>

      {displayResult && (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            <MaturityClassificationDisplay
              classification_string={String(displayResult.classification_string)}
              matrix_x_coordinate={Number(displayResult.matrix_x_coordinate)}
              matrix_y_coordinate={Number(displayResult.matrix_y_coordinate)}
              risk_classification={String(displayResult.risk_classification)}
              opportunity_classification={String(displayResult.opportunity_classification)}
              created_at={displayResult.created_at as string | undefined}
            />
            <div>
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-2">Matrix position</h3>
              <MaturityMatrixViz
                x={Number(displayResult.matrix_x_coordinate)}
                y={Number(displayResult.matrix_y_coordinate)}
              />
            </div>
          </div>

          {history.length > 1 && (
            <div className="glass-card overflow-hidden">
              <h3 className="px-4 py-3 text-sm font-medium text-zinc-700 bg-zinc-50 border-b border-zinc-200">History</h3>
              <table className="w-full text-left">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-2 text-sm font-medium text-zinc-700">Date</th>
                    <th className="px-4 py-2 text-sm font-medium text-zinc-700">Classification</th>
                    <th className="px-4 py-2 text-sm font-medium text-zinc-700">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((r, i) => (
                    <tr key={i} className="border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-2 text-sm text-zinc-900">{r.created_at ? new Date(r.created_at as string).toLocaleString() : '—'}</td>
                      <td className="px-4 py-2 text-sm text-zinc-900">{String(r.classification_string)}</td>
                      <td className="px-4 py-2 text-sm text-zinc-600">{String(r.risk_classification)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
