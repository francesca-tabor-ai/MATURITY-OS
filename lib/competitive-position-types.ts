/** Module 3.3: Competitive Position Analysis™ – types */

export type CompetitiveRiskLevel = 'Low' | 'Medium' | 'High';

export interface CompetitorScore {
  organisation_id: string;
  name?: string;
  data_maturity: number;
  ai_maturity: number;
}

export interface CompetitiveRiskResult {
  level: CompetitiveRiskLevel;
  score: number; // 0-100, higher = more risk
}

export interface CompetitivePositionReport {
  organisation_id: string;
  organisation_name?: string;
  data_maturity: number;
  ai_maturity: number;
  competitors: CompetitorScore[];
  competitive_risk_level: CompetitiveRiskLevel;
  competitive_risk_score: number;
  competitive_advantage_score: number;
  strengths: string[];
  weaknesses: string[];
  generated_at: string;
  comparison_data: {
    organisation: { data_maturity: number; ai_maturity: number };
    competitors: CompetitorScore[];
    avg_competitor_data: number;
    avg_competitor_ai: number;
  };
}
