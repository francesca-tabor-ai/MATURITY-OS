/**
 * Module 3.3: Competitive Position Analysis™
 * Competitive risk and advantage from org vs competitor maturity scores.
 */

import type {
  CompetitiveRiskLevel,
  CompetitiveRiskResult,
  CompetitorScore,
  CompetitivePositionReport,
} from './competitive-position-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Competitive risk: higher when organisation is behind competitors.
 * Returns qualitative level and a 0-100 risk score (higher = more at risk).
 */
export function calculate_competitive_risk(
  orgDataScore: number,
  orgAIScore: number,
  avgCompetitorData: number,
  avgCompetitorAI: number
): CompetitiveRiskResult {
  const dataGap = avgCompetitorData - orgDataScore; // positive = competitors ahead
  const aiGap = avgCompetitorAI - orgAIScore;
  const gap = (Math.max(0, dataGap) + Math.max(0, aiGap)) / 2; // 0-100 scale
  const riskScore = clamp(gap * 1.2, 0, 100); // stretch so typical gaps map to 0-100

  let level: CompetitiveRiskLevel = 'Low';
  if (riskScore >= 50) level = 'High';
  else if (riskScore >= 25) level = 'Medium';

  return {
    level,
    score: Math.round(riskScore * 100) / 100,
  };
}

/**
 * Competitive advantage: 0-100, higher when organisation leads in data and AI vs competitors.
 */
export function calculate_competitive_advantage(
  orgDataScore: number,
  orgAIScore: number,
  competitors: CompetitorScore[]
): number {
  if (competitors.length === 0) return 50; // neutral when no comparison

  const maxData = Math.max(...competitors.map((c) => c.data_maturity), 1);
  const maxAi = Math.max(...competitors.map((c) => c.ai_maturity), 1);
  const avgData = competitors.reduce((s, c) => s + c.data_maturity, 0) / competitors.length;
  const avgAi = competitors.reduce((s, c) => s + c.ai_maturity, 0) / competitors.length;

  const leadData = orgDataScore - avgData; // positive = ahead
  const leadAi = orgAIScore - avgAi;
  const shareOfMaxData = maxData > 0 ? orgDataScore / maxData : 0.5;
  const shareOfMaxAi = maxAi > 0 ? orgAIScore / maxAi : 0.5;

  let advantage = 50;
  advantage += leadData * 0.3 + leadAi * 0.3; // up to ±30 from mean diff
  advantage += (shareOfMaxData - 0.5) * 20 + (shareOfMaxAi - 0.5) * 20; // position vs leader
  return clamp(Math.round(advantage * 100) / 100, 0, 100);
}

function buildInsights(
  orgData: number,
  orgAi: number,
  competitors: CompetitorScore[],
  riskLevel: CompetitiveRiskLevel,
  advantageScore: number
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (competitors.length === 0) return { strengths, weaknesses };

  const avgData = competitors.reduce((s, c) => s + c.data_maturity, 0) / competitors.length;
  const avgAi = competitors.reduce((s, c) => s + c.ai_maturity, 0) / competitors.length;

  if (orgData > avgData + 5) strengths.push('Data maturity above competitor average.');
  else if (orgData < avgData - 5) weaknesses.push('Data maturity below competitor average.');

  if (orgAi > avgAi + 5) strengths.push('AI maturity above competitor average.');
  else if (orgAi < avgAi - 5) weaknesses.push('AI maturity below competitor average.');

  if (advantageScore >= 65) strengths.push('Strong overall competitive advantage vs peers.');
  else if (advantageScore < 40) weaknesses.push('Limited competitive advantage; consider accelerating data and AI initiatives.');

  if (riskLevel === 'High') weaknesses.push('Competitive risk is high; competitors may be pulling ahead.');
  else if (riskLevel === 'Low') strengths.push('Competitive risk is low; position is relatively secure.');

  return { strengths, weaknesses };
}

/**
 * Run full competitive position analysis from pre-fetched org and competitor scores.
 */
export function runCompetitivePositionAnalysis(
  organisationId: string,
  organisationName: string | null,
  orgDataScore: number,
  orgAiScore: number,
  competitors: CompetitorScore[]
): CompetitivePositionReport {
  const orgData = clamp(orgDataScore, 0, 100);
  const orgAi = clamp(orgAiScore, 0, 100);

  const avgCompetitorData =
    competitors.length > 0
      ? competitors.reduce((s, c) => s + c.data_maturity, 0) / competitors.length
      : orgData;
  const avgCompetitorAi =
    competitors.length > 0
      ? competitors.reduce((s, c) => s + c.ai_maturity, 0) / competitors.length
      : orgAi;

  const risk = calculate_competitive_risk(orgData, orgAi, avgCompetitorData, avgCompetitorAi);
  const advantage = calculate_competitive_advantage(orgData, orgAi, competitors);
  const { strengths, weaknesses } = buildInsights(
    orgData,
    orgAi,
    competitors,
    risk.level,
    advantage
  );

  return {
    organisation_id: organisationId,
    organisation_name: organisationName ?? undefined,
    data_maturity: orgData,
    ai_maturity: orgAi,
    competitors,
    competitive_risk_level: risk.level,
    competitive_risk_score: risk.score,
    competitive_advantage_score: advantage,
    strengths,
    weaknesses,
    generated_at: new Date().toISOString(),
    comparison_data: {
      organisation: { data_maturity: orgData, ai_maturity: orgAi },
      competitors,
      avg_competitor_data: Math.round(avgCompetitorData * 100) / 100,
      avg_competitor_ai: Math.round(avgCompetitorAi * 100) / 100,
    },
  };
}
