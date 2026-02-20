'use client';

import { useState, useEffect } from 'react';
import { ROIInvestmentForm } from '@/components/roi-investment-form';
import { ROIResultsDisplay } from '@/components/roi-results-display';

export function ROIInvestmentPageClient({ organisationId }: { organisationId: string }) {
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch(`/api/organisations/${organisationId}/roi-investment`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setHistory(data);
          if (data.length > 0) setLastResult(data[0] as Record<string, unknown>);
        }
      })
      .catch(() => {});
  }, [organisationId]);

  function handleSuccess(result: Record<string, unknown>) {
    setLastResult(result);
    setHistory((prev) => [result, ...prev]);
  }

  return (
    <div className="space-y-8">
      <ROIInvestmentForm organisationId={organisationId} onSuccess={handleSuccess} />

      {lastResult && (
        <>
          <ROIResultsDisplay
            required_data_investment={Number(lastResult.required_data_investment)}
            required_ai_investment={Number(lastResult.required_ai_investment)}
            total_investment={Number(lastResult.total_investment)}
            expected_roi_pct={lastResult.expected_roi_pct != null ? Number(lastResult.expected_roi_pct) : null}
            expected_roi_multiplier={lastResult.expected_roi_multiplier != null ? Number(lastResult.expected_roi_multiplier) : null}
            payback_period_years={lastResult.payback_period_years != null ? Number(lastResult.payback_period_years) : null}
            payback_period_months={lastResult.payback_period_months != null ? Number(lastResult.payback_period_months) : null}
            created_at={lastResult.created_at as string | undefined}
          />
          {history.length > 1 && (
            <div className="glass-card overflow-hidden">
              <h3 className="px-4 py-3 text-sm font-medium text-zinc-700 bg-zinc-50 border-b border-zinc-200">Previous scenarios</h3>
              <ul className="divide-y divide-zinc-100">
                {history.slice(1, 6).map((r, i) => (
                  <li key={i} className="px-4 py-2 flex justify-between text-sm">
                    <span className="text-zinc-600">{r.created_at ? new Date(r.created_at as string).toLocaleString() : '—'}</span>
                    <span className="font-medium text-zinc-900">
                      Invest: ${Number(r.total_investment).toLocaleString()} · ROI: {r.expected_roi_pct != null ? `${Number(r.expected_roi_pct).toFixed(0)}%` : '—'} · Payback: {r.payback_period_years != null ? `${Number(r.payback_period_years).toFixed(1)}y` : '—'}
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
