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
import type { MaturityProgressPayload, GoalTracking } from '@/lib/maturity-progress-types';

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function MaturityProgressTracker({ organisationId }: { organisationId: string }) {
  const now = new Date();
  const defaultTo = now.toISOString().slice(0, 10);
  const defaultFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [data, setData] = useState<MaturityProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [goalForm, setGoalForm] = useState({ goal_type: 'data' as 'data' | 'ai', target_score: '70', target_date: '' });
  const [goalSaving, setGoalSaving] = useState(false);

  const fetchProgress = useCallback(() => {
    setLoading(true);
    setError('');
    fetch(`/api/organisations/${organisationId}/maturity-progress?from=${from}&to=${to}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load progress');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false));
  }, [organisationId, from, to]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleSetGoal = () => {
    const score = parseInt(goalForm.target_score, 10);
    const date = goalForm.target_date.trim().slice(0, 10);
    if (!Number.isFinite(score) || score < 0 || score > 100 || !date) {
      setError('Target score 0–100 and target date required.');
      return;
    }
    setGoalSaving(true);
    setError('');
    fetch(`/api/organisations/${organisationId}/maturity-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal_type: goalForm.goal_type,
        target_score: score,
        target_date: date,
      }),
    })
      .then((r) => r.ok ? r.json() : r.json().then((d) => Promise.reject(new Error(d.error))))
      .then(() => {
        fetchProgress();
        setGoalForm((f) => ({ ...f, target_score: '70', target_date: '' }));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setGoalSaving(false));
  };

  if (loading && !data) {
    return <div className="py-12 text-center text-zinc-500">Loading progress…</div>;
  }
  if (error && !data) {
    return (
      <div className="glass-card p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  const progress = data?.progress ?? null;
  const goalTracking = data?.goal_tracking ?? [];
  const history = data?.history ?? [];
  const currentData = data?.current_data_maturity ?? 0;
  const currentAi = data?.current_ai_maturity ?? 0;

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="glass-card p-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field w-40" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field w-40" />
        </div>
        <button type="button" onClick={fetchProgress} className="btn-primary">
          Update
        </button>
      </div>

      {progress && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass-card p-4">
            <p className="text-xs font-medium text-zinc-500 uppercase">Data maturity improvement</p>
            <p className={`text-2xl font-bold mt-1 ${progress.data_improvement_pct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {progress.data_improvement_pct >= 0 ? '+' : ''}{progress.data_improvement_pct.toFixed(1)}%
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{progress.start_data_maturity.toFixed(0)} → {progress.end_data_maturity.toFixed(0)}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs font-medium text-zinc-500 uppercase">AI maturity improvement</p>
            <p className={`text-2xl font-bold mt-1 ${progress.ai_improvement_pct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {progress.ai_improvement_pct >= 0 ? '+' : ''}{progress.ai_improvement_pct.toFixed(1)}%
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{progress.start_ai_maturity.toFixed(0)} → {progress.end_ai_maturity.toFixed(0)}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs font-medium text-zinc-500 uppercase">Data points</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{progress.data_points_count}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{formatDate(progress.period_start)} – {formatDate(progress.period_end)}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs font-medium text-zinc-500 uppercase">Current scores</p>
            <p className="text-lg font-bold text-zinc-900 mt-1">Data {currentData.toFixed(0)} / AI {currentAi.toFixed(0)}</p>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Maturity trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number | undefined) => [v != null ? v.toFixed(1) : '—', '']} labelFormatter={(_, payload) => payload?.[0]?.payload?.at ? formatDate(payload[0].payload.at) : ''} />
                <Legend />
                <Line type="monotone" dataKey="data_maturity" name="Data maturity" stroke="rgb(99 102 241)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="ai_maturity" name="AI maturity" stroke="rgb(16 185 129)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Goals</h3>
        <div className="flex flex-wrap items-end gap-3 mb-6">
          <select
            value={goalForm.goal_type}
            onChange={(e) => setGoalForm((f) => ({ ...f, goal_type: e.target.value as 'data' | 'ai' }))}
            className="input-field w-32"
          >
            <option value="data">Data maturity</option>
            <option value="ai">AI maturity</option>
          </select>
          <input
            type="number"
            min={0}
            max={100}
            value={goalForm.target_score}
            onChange={(e) => setGoalForm((f) => ({ ...f, target_score: e.target.value }))}
            placeholder="Target score"
            className="input-field w-24"
          />
          <input
            type="date"
            value={goalForm.target_date}
            onChange={(e) => setGoalForm((f) => ({ ...f, target_date: e.target.value }))}
            className="input-field w-40"
          />
          <button type="button" onClick={handleSetGoal} disabled={goalSaving} className="btn-primary">
            {goalSaving ? 'Saving…' : 'Set goal'}
          </button>
        </div>

        {goalTracking.length === 0 ? (
          <p className="text-zinc-500 text-sm">No goals set. Set a target score and date above.</p>
        ) : (
          <div className="space-y-6">
            {goalTracking.map((t: GoalTracking) => (
              <div key={t.goal.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-zinc-900">{t.goal.goal_type === 'data' ? 'Data maturity' : 'AI maturity'}</span>
                  <span className={`text-sm font-medium ${t.on_track ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {t.on_track ? 'On track' : 'Behind'}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-zinc-200 overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${Math.min(100, (t.current_score / t.target_score) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-600">
                  Current {t.current_score.toFixed(0)} / Target {t.target_score.toFixed(0)}
                  {t.variance !== 0 && ` · Variance ${t.variance >= 0 ? '+' : ''}${t.variance.toFixed(0)}`}
                  {t.projected_date && ` · Projected ${formatDate(t.projected_date)}`}
                  {t.progress_rate_per_month !== 0 && ` · Rate ${t.progress_rate_per_month >= 0 ? '+' : ''}${t.progress_rate_per_month.toFixed(2)}/mo`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {!progress && history.length === 0 && (
        <div className="glass-card p-8 text-center text-zinc-500">
          No snapshot history in this period. Use Live maturity to sync from audits and record points over time.
        </div>
      )}
    </div>
  );
}
