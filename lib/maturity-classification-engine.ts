/**
 * Core Module 0.4: Maturity Classification Engine™
 * Maps (data_maturity_index, ai_maturity_score) to matrix position, classification, risk, and opportunity.
 * Rule engine: first matching rule wins; rules loaded from JSON config.
 */

import type { ClassificationResult, ClassificationRule, ClassificationRulesConfig } from './maturity-classification-types';
import defaultRules from './maturity-classification-rules.json';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function matchesRule(
  dataIndex: number,
  aiScore: number,
  rule: ClassificationRule
): boolean {
  return (
    dataIndex >= rule.data_index_min &&
    dataIndex <= rule.data_index_max &&
    aiScore >= rule.ai_score_min &&
    aiScore <= rule.ai_score_max
  );
}

/**
 * Classify maturity from data_maturity_index (0-100) and ai_maturity_score (0-100).
 * Returns classification string, matrix coordinates [x, y], risk, and opportunity.
 */
export function classifyMaturity(
  dataMaturityIndex: number,
  aiMaturityScore: number,
  rulesConfig: ClassificationRulesConfig = defaultRules as ClassificationRulesConfig
): ClassificationResult {
  const dataIndex = clamp(dataMaturityIndex, 0, 100);
  const aiScore = clamp(aiMaturityScore, 0, 100);

  const rules = rulesConfig.rules ?? (defaultRules as ClassificationRulesConfig).rules;
  const matched = rules.find((r) => matchesRule(dataIndex, aiScore, r));

  if (matched) {
    return {
      classification_string: matched.classification_string,
      matrix_x_coordinate: Math.round(dataIndex * 100) / 100,
      matrix_y_coordinate: Math.round(aiScore * 100) / 100,
      risk_classification: matched.risk,
      opportunity_classification: matched.opportunity,
      details: { rule_id: matched.id, config_version: rulesConfig.version },
    };
  }

  // Fallback: generic by quadrant
  const highData = dataIndex >= 50;
  const highAI = aiScore >= 50;
  let classification_string = 'Emerging Explorer';
  let risk: 'Low' | 'Medium' | 'High' = 'Medium';
  let opportunity: string = 'Foundation First';
  if (highData && highAI) {
    classification_string = 'Intelligent Operator';
    risk = 'Low';
    opportunity = 'Optimise & Innovate';
  } else if (highData && !highAI) {
    classification_string = 'Data-Curious';
    risk = 'Medium';
    opportunity = 'Pilot AI';
  } else if (!highData && highAI) {
    classification_string = 'AI Experimenter';
    risk = 'High';
    opportunity = 'Quick Wins on Data';
  }

  return {
    classification_string,
    matrix_x_coordinate: Math.round(dataIndex * 100) / 100,
    matrix_y_coordinate: Math.round(aiScore * 100) / 100,
    risk_classification: risk,
    opportunity_classification: opportunity,
    details: { fallback: true },
  };
}

/** Rule engine: load rules from JSON (for dynamic updates). In browser/Node, pass parsed config. */
export function createRuleEngine(config: ClassificationRulesConfig) {
  return {
    classify(dataMaturityIndex: number, aiMaturityScore: number): ClassificationResult {
      return classifyMaturity(dataMaturityIndex, aiMaturityScore, config);
    },
    getRules(): ClassificationRule[] {
      return config.rules ?? [];
    },
  };
}

export { defaultRules };
