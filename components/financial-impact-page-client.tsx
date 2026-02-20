'use client';

import { useState, useEffect } from 'react';
import { FinancialImpactForm } from '@/components/financial-impact-form';
import { FinancialImpactDashboard } from '@/components/financial-impact-dashboard';

export function FinancialImpactPageClient({ organisationId }: { organisationId: string }) {
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch(`/api/organisations/${organisationId}/financial-impact`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
        if (data.length > 0 && !lastResult) setLastResult(data[0] as Record<string, unknown>);
      })
      .catch(() => {});
  }, [organisationId]);

  function handleSuccess(result: Record<string, unknown>) {
    setLastResult(result);
    setHistory((prev) => [result, ...prev]);
  }

  return (
    <div className="space-y-8">
      <FinancialImpactForm organisationId={organisationId} onSuccess={handleSuccess} />

      {lastResult && (
        <>
          <FinancialImpactDashboard result={lastResult as never} />
          {history.length > 1 && (
            <div className="glass-card overflow-hidden">
              <h3 className="px-4 py-3 text-sm font-medium text-zinc-700 bg-zinc-50 border-b border-zinc-200">Previous runs</h3>
              <ul className="divide-y divide-zinc-100">
                {history.slice(1, 6).map((r, i) => (
                  <li key={i} className="px-4 py-2 flex justify-between text-sm">
                    <span className="text-zinc-600">{r.created_at ? new Date(r.created_at as string).toLocaleString() : '—'}</span>
                    <span className="font-medium text-zinc-900">
                      Upside: ${Number(r.revenue_upside).toLocaleString()} · Cost red.: ${Number(r.cost_reduction).toLocaleString()}
                    </span>
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
