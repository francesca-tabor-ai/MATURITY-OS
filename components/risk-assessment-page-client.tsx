'use client';

import { useState, useEffect } from 'react';
import { RiskAssessmentForm } from '@/components/risk-assessment-form';
import { RiskAssessmentDisplay } from '@/components/risk-assessment-display';

export function RiskAssessmentPageClient({ organisationId }: { organisationId: string }) {
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    fetch(`/api/organisations/${organisationId}/risk-assessment`)
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
      <RiskAssessmentForm organisationId={organisationId} onSuccess={handleSuccess} />

      {lastResult && (
        <>
          <RiskAssessmentDisplay
            overall_risk_score={Number(lastResult.overall_risk_score)}
            risk_level={String(lastResult.risk_level)}
            ai_misalignment_risk_score={Number((lastResult.ai_misalignment_risk as { score: number })?.score ?? lastResult.ai_misalignment_risk_score)}
            infrastructure_risk_score={Number((lastResult.infrastructure_risk as { score: number })?.score ?? lastResult.infrastructure_risk_score)}
            operational_risk_score={Number((lastResult.operational_risk as { score: number })?.score ?? lastResult.operational_risk_score)}
            strategic_risk_score={Number((lastResult.strategic_risk as { score: number })?.score ?? lastResult.strategic_risk_score)}
            summary={(lastResult.summary ?? (lastResult.details as { summary?: string[] })?.summary) as string[] | undefined}
            created_at={lastResult.created_at as string | undefined}
          />
          {history.length > 1 && (
            <div className="glass-card overflow-hidden">
              <h3 className="px-4 py-3 text-sm font-medium text-zinc-700 bg-zinc-50 border-b border-zinc-200">Previous assessments</h3>
              <ul className="divide-y divide-zinc-100">
                {history.slice(1, 6).map((r, i) => (
                  <li key={i} className="px-4 py-2 flex justify-between text-sm">
                    <span className="text-zinc-600">{r.created_at ? new Date(r.created_at as string).toLocaleString() : '—'}</span>
                    <span className="font-medium text-zinc-900">
                      Score: {Number(r.overall_risk_score)} · {String(r.risk_level)}
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
