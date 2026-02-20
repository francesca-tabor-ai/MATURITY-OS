/**
 * Module 1.2: ROI & Investment Calculator™
 * Required investment (data + AI) from maturity gap; ROI and payback from benefits vs investment.
 */

import type { ROIInvestmentInputs, ROIInvestmentOutput } from './roi-investment-types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Cost per "point" of data maturity gap (software, infra, talent, training). */
const DATA_INVESTMENT_PER_POINT = 15000;
/** Cost per "point" of AI maturity gap. */
const AI_INVESTMENT_PER_POINT = 22000;

/**
 * Required investment to bridge maturity gap. Factors: gap size, base costs per point.
 * Data: licenses, storage, integration, governance tools, training.
 * AI: platforms, models, talent, training.
 */
export function calculateRequiredInvestment(
  currentData: number,
  currentAi: number,
  targetData: number,
  targetAi: number
): { data_investment: number; ai_investment: number; total: number } {
  const currD = clamp(currentData, 0, 100);
  const currA = clamp(currentAi, 0, 100);
  const tgtD = clamp(targetData, 0, 100);
  const tgtA = clamp(targetAi, 0, 100);
  const gapData = Math.max(0, tgtD - currD);
  const gapAi = Math.max(0, tgtA - currA);

  const data_investment = gapData * DATA_INVESTMENT_PER_POINT;
  const ai_investment = gapAi * AI_INVESTMENT_PER_POINT;
  const total = data_investment + ai_investment;

  return {
    data_investment: Math.round(data_investment * 100) / 100,
    ai_investment: Math.round(ai_investment * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Expected ROI. Formula: (financial_benefits / total_investment) * 100 for %, or
 * benefits / investment for multiplier. Returns null if investment is 0.
 */
export function calculateExpectedROI(
  financialBenefits: number,
  totalInvestment: number
): { roi_pct: number | null; roi_multiplier: number | null } {
  if (totalInvestment <= 0) return { roi_pct: null, roi_multiplier: null };
  const multiplier = financialBenefits / totalInvestment;
  const roi_pct = (multiplier - 1) * 100;
  return {
    roi_pct: Math.round(roi_pct * 100) / 100,
    roi_multiplier: Math.round(multiplier * 100) / 100,
  };
}

/**
 * Payback period: total_investment / annual_benefits = years.
 * If annual_benefits <= 0 or insufficient, returns null (or very large value).
 */
export function calculatePaybackPeriod(
  totalInvestment: number,
  annualBenefits: number
): { years: number | null; months: number | null } {
  if (annualBenefits <= 0 || totalInvestment <= 0) return { years: null, months: null };
  const years = totalInvestment / annualBenefits;
  return {
    years: Math.round(years * 100) / 100,
    months: Math.round((years * 12) * 100) / 100,
  };
}

export class ROIInvestmentCalculator {
  private inputs: ROIInvestmentInputs;

  constructor(inputs: ROIInvestmentInputs) {
    this.inputs = inputs;
  }

  setInputs(inputs: ROIInvestmentInputs): void {
    this.inputs = inputs;
  }

  calculate(): ROIInvestmentOutput {
    const { current_data_maturity, target_data_maturity, current_ai_maturity, target_ai_maturity, estimated_financial_benefits, annual_benefits } = this.inputs;

    const inv = calculateRequiredInvestment(
      current_data_maturity,
      current_ai_maturity,
      target_data_maturity,
      target_ai_maturity
    );

    const roi = calculateExpectedROI(estimated_financial_benefits, inv.total);
    const annual = annual_benefits ?? estimated_financial_benefits;
    const payback = calculatePaybackPeriod(inv.total, annual);

    return {
      required_data_investment: inv.data_investment,
      required_ai_investment: inv.ai_investment,
      total_investment: inv.total,
      expected_roi_pct: roi.roi_pct,
      expected_roi_multiplier: roi.roi_multiplier,
      payback_period_years: payback.years,
      payback_period_months: payback.months,
      details: {
        data_gap: Math.max(0, target_data_maturity - current_data_maturity),
        ai_gap: Math.max(0, target_ai_maturity - current_ai_maturity),
      },
    };
  }

  /** Scenario: change targets and recalc. */
  scenario(targetData: number, targetAi: number): ROIInvestmentOutput {
    const prev = this.inputs;
    this.inputs = { ...prev, target_data_maturity: targetData, target_ai_maturity: targetAi };
    const out = this.calculate();
    this.inputs = prev;
    return out;
  }

  toJSON(): ROIInvestmentOutput {
    return this.calculate();
  }
}

export function runROIInvestment(inputs: ROIInvestmentInputs): ROIInvestmentOutput {
  const calc = new ROIInvestmentCalculator(inputs);
  return calc.calculate();
}
