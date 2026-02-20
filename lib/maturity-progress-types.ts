/**
 * Module 5.3: Maturity Progress Tracking™ – types
 */

export type GoalType = 'data' | 'ai';

export interface MaturityGoal {
  id: string;
  organisation_id: string;
  goal_type: GoalType;
  target_score: number;
  target_date: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  at: string;
  data_maturity_index: number;
  ai_maturity_score: number;
  label?: string;
}

/** Result of calculate_maturity_progress */
export interface MaturityProgressResult {
  period_start: string;
  period_end: string;
  start_data_maturity: number;
  end_data_maturity: number;
  start_ai_maturity: number;
  end_ai_maturity: number;
  data_improvement_pct: number;
  ai_improvement_pct: number;
  data_points_count: number;
  milestones: Milestone[];
}

/** Single goal tracking (variance, projection) */
export interface GoalTracking {
  goal: MaturityGoal;
  current_score: number;
  target_score: number;
  variance: number;
  variance_pct: number;
  projected_date: string | null;
  on_track: boolean;
  progress_rate_per_month: number;
}

/** Point for trend chart */
export interface ProgressChartPoint {
  at: string;
  label: string;
  data_maturity: number;
  ai_maturity: number;
}

/** Full payload for progress tracking API */
export interface MaturityProgressPayload {
  progress: MaturityProgressResult | null;
  goals: MaturityGoal[];
  goal_tracking: GoalTracking[];
  current_data_maturity: number | null;
  current_ai_maturity: number | null;
  history: ProgressChartPoint[];
}
