/**
 * Module 5.3: Maturity Progress Tracking™
 * Progress calculation and goal tracking from maturity_snapshots and maturity_goals.
 */

import { query, queryOne } from '@/lib/db';
import { getMaturityHistory, getLatestSnapshot } from './live-maturity-service';
import type { MaturitySnapshot } from './live-maturity-types';
import type {
  MaturityGoal,
  MaturityProgressResult,
  GoalTracking,
  Milestone,
  MaturityProgressPayload,
  ProgressChartPoint,
} from './maturity-progress-types';

function parseDate(s: string): Date {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Calculate percentage improvement and milestones over a time period from historical snapshots.
 */
export function calculate_maturity_progress(
  history: MaturitySnapshot[],
  periodStart: string,
  periodEnd: string
): MaturityProgressResult {
  const start = parseDate(periodStart).getTime();
  const end = parseDate(periodEnd).getTime();
  const inRange = history.filter((h) => {
    const t = new Date(h.snapshot_at).getTime();
    return t >= start && t <= end;
  });

  const dataPointsCount = inRange.length;
  const first = inRange[0];
  const last = inRange[inRange.length - 1];
  const startData = first?.data_maturity_index ?? 0;
  const endData = last?.data_maturity_index ?? 0;
  const startAi = first?.ai_maturity_score ?? 0;
  const endAi = last?.ai_maturity_score ?? 0;

  const dataImprovementPct = startData > 0 ? ((endData - startData) / startData) * 100 : (endData > 0 ? 100 : 0);
  const aiImprovementPct = startAi > 0 ? ((endAi - startAi) / startAi) * 100 : (endAi > 0 ? 100 : 0);

  const milestones: Milestone[] = [];
  if (first) milestones.push({ at: first.snapshot_at, data_maturity_index: first.data_maturity_index, ai_maturity_score: first.ai_maturity_score, label: 'Period start' });
  let prevData = first?.data_maturity_index ?? 0;
  let prevAi = first?.ai_maturity_score ?? 0;
  for (let i = 1; i < inRange.length - 1; i++) {
    const s = inRange[i];
    if (Math.abs(s.data_maturity_index - prevData) >= 5 || Math.abs(s.ai_maturity_score - prevAi) >= 5) {
      milestones.push({ at: s.snapshot_at, data_maturity_index: s.data_maturity_index, ai_maturity_score: s.ai_maturity_score });
      prevData = s.data_maturity_index;
      prevAi = s.ai_maturity_score;
    }
  }
  if (last && inRange.length > 1) milestones.push({ at: last.snapshot_at, data_maturity_index: last.data_maturity_index, ai_maturity_score: last.ai_maturity_score, label: 'Period end' });

  return {
    period_start: periodStart,
    period_end: periodEnd,
    start_data_maturity: startData,
    end_data_maturity: endData,
    start_ai_maturity: startAi,
    end_ai_maturity: endAi,
    data_improvement_pct: Math.round(dataImprovementPct * 100) / 100,
    ai_improvement_pct: Math.round(aiImprovementPct * 100) / 100,
    data_points_count: dataPointsCount,
    milestones,
  };
}

const MS_PER_MONTH = 30 * 24 * 60 * 60 * 1000;

/**
 * Project months needed to reach target from current at given rate per month.
 */
function projectMonthsToTarget(current: number, target: number, ratePerMonth: number): number | null {
  if (ratePerMonth <= 0) return current >= target ? 0 : null;
  const gap = target - current;
  if (gap <= 0) return 0;
  return gap / ratePerMonth;
}

/**
 * Track goals: variance from target, projected date, on_track flag.
 */
export function track_maturity_goals(
  goals: MaturityGoal[],
  currentData: number,
  currentAi: number,
  history: MaturitySnapshot[],
  periodMonths: number
): GoalTracking[] {
  const tracking: GoalTracking[] = [];
  const sortedHistory = [...history].sort((a, b) => new Date(a.snapshot_at).getTime() - new Date(b.snapshot_at).getTime());
  const dataRate = computeProgressRate(sortedHistory, 'data', periodMonths);
  const aiRate = computeProgressRate(sortedHistory, 'ai', periodMonths);

  for (const goal of goals) {
    const current = goal.goal_type === 'data' ? currentData : currentAi;
    const target = goal.target_score;
    const variance = target - current;
    const variancePct = target > 0 ? (variance / target) * 100 : 0;
    const rate = goal.goal_type === 'data' ? dataRate : aiRate;
    const monthsToTarget = projectMonthsToTarget(current, target, rate);
    const targetDate = parseDate(goal.target_date).getTime();
    const now = Date.now();
    const monthsUntilTarget = (targetDate - now) / MS_PER_MONTH;
    const projectedDate = monthsToTarget != null ? new Date(now + monthsToTarget * MS_PER_MONTH).toISOString().slice(0, 10) : null;
    const onTrack = monthsToTarget != null && monthsUntilTarget > 0 ? monthsToTarget <= monthsUntilTarget : (variance <= 0);

    tracking.push({
      goal,
      current_score: current,
      target_score: target,
      variance: Math.round(variance * 100) / 100,
      variance_pct: Math.round(variancePct * 100) / 100,
      projected_date: projectedDate,
      on_track: onTrack,
      progress_rate_per_month: Math.round(rate * 1000) / 1000,
    });
  }

  return tracking;
}

function computeProgressRate(history: MaturitySnapshot[], type: 'data' | 'ai', periodMonths: number): number {
  if (history.length < 2 || periodMonths <= 0) return 0;
  const first = history[0];
  const last = history[history.length - 1];
  const start = type === 'data' ? first.data_maturity_index : first.ai_maturity_score;
  const end = type === 'data' ? last.data_maturity_index : last.ai_maturity_score;
  const delta = end - start;
  return delta / periodMonths;
}

export async function getMaturityGoals(organisationId: string): Promise<MaturityGoal[]> {
  const rows = await query<{
    id: string;
    organisation_id: string;
    goal_type: string;
    target_score: unknown;
    target_date: string;
    created_at: string;
    updated_at: string;
  }>(
    'SELECT id, organisation_id, goal_type, target_score, target_date, created_at, updated_at FROM maturity_goals WHERE organisation_id = $1 ORDER BY goal_type',
    [organisationId]
  );
  return rows.map((r) => ({
    id: r.id,
    organisation_id: r.organisation_id,
    goal_type: r.goal_type as 'data' | 'ai',
    target_score: Number(r.target_score),
    target_date: r.target_date,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function setMaturityGoal(
  organisationId: string,
  goalType: 'data' | 'ai',
  targetScore: number,
  targetDate: string,
  userId?: string | null
): Promise<MaturityGoal> {
  const score = Math.max(0, Math.min(100, targetScore));
  const row = await queryOne<{ id: string; created_at: string; updated_at: string }>(
    `INSERT INTO maturity_goals (organisation_id, goal_type, target_score, target_date, created_by)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (organisation_id, goal_type) DO UPDATE SET target_score = $3, target_date = $4, updated_at = NOW()
     RETURNING id, created_at, updated_at`,
    [organisationId, goalType, score, targetDate, userId ?? null]
  );
  if (!row) throw new Error('Failed to upsert goal');
  const goals = await getMaturityGoals(organisationId);
  const g = goals.find((x) => x.goal_type === goalType);
  if (!g) throw new Error('Goal not found after upsert');
  return g;
}

/**
 * Full progress payload for the given organisation and time range.
 */
export async function getMaturityProgressPayload(
  organisationId: string,
  from: string,
  to: string
): Promise<MaturityProgressPayload> {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const history = await getMaturityHistory(organisationId, { limit: 500, since: fromDate });
  const inRange = history.filter((h) => {
    const t = new Date(h.snapshot_at).getTime();
    return t <= toDate.getTime();
  });

  const latest = await getLatestSnapshot(organisationId);
  const currentData = latest?.data_maturity_index ?? 0;
  const currentAi = latest?.ai_maturity_score ?? 0;

  const progress = inRange.length >= 1
    ? calculate_maturity_progress(history, from, to)
    : null;

  const goals = await getMaturityGoals(organisationId);
  const periodMonths = Math.max(0.1, (toDate.getTime() - fromDate.getTime()) / MS_PER_MONTH);
  const goal_tracking = track_maturity_goals(goals, currentData, currentAi, inRange, periodMonths);

  const chartPoints: ProgressChartPoint[] = inRange.map((h) => ({
    at: h.snapshot_at,
    label: new Date(h.snapshot_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }),
    data_maturity: h.data_maturity_index,
    ai_maturity: h.ai_maturity_score,
  }));

  return {
    progress,
    goals,
    goal_tracking,
    current_data_maturity: latest?.data_maturity_index ?? null,
    current_ai_maturity: latest?.ai_maturity_score ?? null,
    history: chartPoints,
  };
}
