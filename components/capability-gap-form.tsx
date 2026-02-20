'use client';

import { useState, useEffect } from 'react';

export function CapabilityGapForm({
  organisationId,
  onSuccess,
}: {
  organisationId: string;
  onSuccess: (result: Record<string, unknown>) => void;
}) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [prefill, setPrefill] = useState<{ data?: Record<string, unknown>; ai?: Record<string, unknown> } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/organisations/${organisationId}/data-audit`).then((r) => r.json()),
      fetch(`/api/organisations/${organisationId}/ai-audit`).then((r) => r.json()),
    ])
      .then(([dataRes, aiRes]) => {
        const dataLatest = Array.isArray(dataRes) ? dataRes[0] : null;
        const aiLatest = Array.isArray(aiRes) ? aiRes[0] : null;
        setPrefill({ data: dataLatest ?? undefined, ai: aiLatest ?? undefined });
      })
      .catch(() => setPrefill({}));
  }, [organisationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data_maturity = prefill?.data
        ? {
            maturity_stage: prefill.data.maturity_stage ?? 1,
            maturity_index: prefill.data.maturity_index ?? 0,
            collection_score: (prefill.data.collection as { score?: number })?.score,
            storage_score: (prefill.data.storage as { score?: number })?.score,
            integration_score: (prefill.data.integration as { score?: number })?.score,
            governance_score: (prefill.data.governance as { score?: number })?.score,
            accessibility_score: (prefill.data.accessibility as { score?: number })?.score,
          }
        : { maturity_stage: 1, maturity_index: 0 };
      const ai_maturity = prefill?.ai
        ? {
            maturity_stage: prefill.ai.maturity_stage ?? 1,
            maturity_score: prefill.ai.maturity_score ?? 0,
            automation_score: (prefill.ai.automation as { score?: number })?.score,
            ai_usage_score: (prefill.ai.ai_usage as { score?: number })?.score,
            deployment_score: (prefill.ai.deployment as { score?: number })?.score,
          }
        : { maturity_stage: 1, maturity_score: 0 };

      const res = await fetch(`/api/organisations/${organisationId}/capability-gaps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_maturity, ai_maturity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      onSuccess(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    }
    setLoading(false);
  }

  const hasPrefill = prefill?.data != null || prefill?.ai != null;
  const dataIndex = prefill?.data != null ? Number((prefill.data as { maturity_index?: number }).maturity_index) : null;
  const aiScore = prefill?.ai != null ? Number((prefill.ai as { maturity_score?: number }).maturity_score) : null;

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 max-w-lg">
      <h3 className="font-semibold text-zinc-900">Run capability gap analysis</h3>
      <p className="text-sm text-zinc-600">
        Uses your latest Data Maturity and AI Maturity assessments to identify missing capabilities against ideal states.
      </p>
      {hasPrefill && (
        <p className="text-sm text-zinc-700">
          Prefilled: Data index {dataIndex ?? '—'}, AI score {aiScore ?? '—'}
        </p>
      )}
      {!hasPrefill && prefill !== null && (
        <p className="text-sm text-amber-700">No audit data found. Run Data and AI Maturity audits first for better results.</p>
      )}
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Analysing…' : 'Run gap analysis'}
      </button>
    </form>
  );
}
