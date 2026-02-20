'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { LiveMaturityState } from '@/lib/live-maturity-types';

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface ChartPoint {
  at: string;
  label: string;
  data: number;
  ai: number;
}

export function LiveMaturityDashboard({ organisationId }: { organisationId: string }) {
  const [state, setState] = useState<LiveMaturityState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [useFeed, setUseFeed] = useState(false);

  const fetchState = useCallback(() => {
    setLoading(true);
    setError('');
    fetch(`/api/organisations/${organisationId}/live-maturity?detect_anomalies=1`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then(setState)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [organisationId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  useEffect(() => {
    if (!useFeed || !organisationId) return;
    const es = new EventSource(`/api/organisations/${organisationId}/live-maturity-feed`);
    es.addEventListener('state', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setState(data);
      } catch (_) {}
    });
    es.addEventListener('update', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setState(data);
      } catch (_) {}
    });
    es.onerror = () => es.close();
    return () => es.close();
  }, [organisationId, useFeed]);

  const syncFromAudits = () => {
    setSyncing(true);
    fetch(`/api/organisations/${organisationId}/live-maturity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sync_from_audits: true }),
    })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('Sync failed')))
      .then(() => fetchState())
      .catch(() => setError('Sync failed'))
      .finally(() => setSyncing(false));
  };

  if (loading && !state) {
    return <div className="py-12 text-center text-zinc-500">Loading live maturity…</div>;
  }
  if (error) {
    return (
      <div className="glass-card p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  const history = state?.history ?? [];
  const anomalies = state?.anomalies ?? [];

  const chartData: ChartPoint[] = history.map((s) => ({
    at: s.snapshot_at,
    label: formatTime(s.snapshot_at),
    data: s.data_maturity_index,
    ai: s.ai_maturity_score,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={syncFromAudits}
          disabled={syncing}
          className="btn-primary"
        >
          {syncing ? 'Syncing…' : 'Sync from latest audits'}
        </button>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={useFeed}
            onChange={(e) => setUseFeed(e.target.checked)}
          />
          Live feed (SSE)
        </label>
        <button type="button" onClick={fetchState} className="input-field">
          Refresh
        </button>
      </div>

      {state?.latest && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="glass-card p-6">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Current data maturity</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{state.latest.data_maturity_index.toFixed(1)}</p>
            <p className="text-xs text-zinc-500 mt-1">{formatTime(state.latest.snapshot_at)} · {state.latest.source ?? 'manual'}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Current AI maturity</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{state.latest.ai_maturity_score.toFixed(1)}</p>
            <p className="text-xs text-zinc-500 mt-1">{formatTime(state.latest.snapshot_at)} · {state.latest.source ?? 'manual'}</p>
          </div>
        </div>
      )}

      {chartData.length === 0 ? (
        <div className="glass-card p-8 text-center text-zinc-500">
          No snapshot history yet. Run Data and AI audits, then click “Sync from latest audits” to record a point.
        </div>
      ) : (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Maturity trend over time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number | undefined) => [v != null ? String(Number(v).toFixed(1)) : '—', '']} labelFormatter={(_, payload) => (payload?.[0]?.payload?.at ? formatTime(payload[0].payload.at) : '')} />
                <Legend />
                <Line type="monotone" dataKey="data" name="Data maturity" stroke="rgb(99 102 241)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="ai" name="AI maturity" stroke="rgb(16 185 129)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {anomalies.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Detected anomalies</h3>
          <ul className="space-y-2">
            {anomalies.slice(0, 20).map((a) => (
              <li
                key={a.id || a.snapshot_at + a.score_type}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                  a.severity === 'HIGH' ? 'border-red-200 bg-red-50' : a.severity === 'MEDIUM' ? 'border-amber-200 bg-amber-50' : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <span>
                  <strong>{a.score_type === 'data' ? 'Data' : 'AI'}</strong> {a.anomaly_type} · {a.severity}
                </span>
                <span className="text-zinc-500">{formatTime(a.snapshot_at)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
