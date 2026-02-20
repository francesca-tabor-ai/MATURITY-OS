'use client';

import { useState, useEffect } from 'react';
import { DataAuditForm } from '@/components/data-audit-form';
import { DataMaturityDashboard } from '@/components/data-maturity-dashboard';

export function DataAuditPageClient({ organisationId }: { organisationId: string }) {
  const [view, setView] = useState<'form' | 'result' | 'history'>('form');
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; maturity_stage: number; maturity_index: number; created_at: string }>>([]);
  const [selectedResult, setSelectedResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/organisations/${organisationId}/data-audit`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(() => {});
  }, [organisationId]);

  function handleSuccess(result: Record<string, unknown>) {
    setLastResult(result);
    setView('result');
    setHistory((prev) => [
      {
        id: result.result_id as string,
        maturity_stage: result.maturity_stage as number,
        maturity_index: result.maturity_index as number,
        created_at: result.created_at as string,
      },
      ...prev,
    ]);
  }

  const resultToShow = lastResult ?? selectedResult;
  if (view === 'result' && resultToShow) {
    return (
      <div className="space-y-6">
        <DataMaturityDashboard result={resultToShow as never} />
        <div className="flex gap-3">
          <button type="button" onClick={() => { setView('form'); setLastResult(null); setSelectedResult(null); }} className="btn-primary">
            New audit
          </button>
          <button type="button" onClick={() => { setView('history'); setSelectedResult(null); }} className="input-field border-zinc-300">
            View history
          </button>
        </div>
      </div>
    );
  }

  if (view === 'history' && history.length > 0) {
    return (
      <div className="space-y-6">
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-zinc-700">Date</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-700">Stage</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-700">Index</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-700"></th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 text-zinc-900">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{r.maturity_stage}</td>
                  <td className="px-4 py-3">{r.maturity_index}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        fetch(`/api/organisations/${organisationId}/data-audit/${r.id}`)
                          .then((res) => res.json())
                          .then((data) => {
                            setSelectedResult(data);
                            setView('result');
                          });
                      }}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={() => { setView('form'); setSelectedResult(null); }} className="btn-primary">
          New audit
        </button>
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="space-y-6">
        <p className="text-zinc-600">No audit results yet. Run your first audit below.</p>
        <button type="button" onClick={() => setView('form')} className="btn-primary">
          New audit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DataAuditForm organisationId={organisationId} onSuccess={handleSuccess} />
      {history.length > 0 && (
        <button type="button" onClick={() => setView('history')} className="text-indigo-600 hover:underline text-sm">
          View audit history ({history.length})
        </button>
      )}
    </div>
  );
}
