import type { IndustryBenchmark } from './financial-impact-types';

export const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  { id: 'default', name: 'Default', revenue_upside_multiplier: 1, margin_expansion_multiplier: 1, cost_reduction_multiplier: 1 },
  { id: 'technology', name: 'Technology', revenue_upside_multiplier: 1.25, margin_expansion_multiplier: 1.2, cost_reduction_multiplier: 1.15 },
  { id: 'finance', name: 'Financial Services', revenue_upside_multiplier: 1.15, margin_expansion_multiplier: 1.1, cost_reduction_multiplier: 1.2 },
  { id: 'healthcare', name: 'Healthcare', revenue_upside_multiplier: 1.1, margin_expansion_multiplier: 1.15, cost_reduction_multiplier: 1.1 },
  { id: 'retail', name: 'Retail', revenue_upside_multiplier: 1.2, margin_expansion_multiplier: 1.1, cost_reduction_multiplier: 1.25 },
  { id: 'manufacturing', name: 'Manufacturing', revenue_upside_multiplier: 1.05, margin_expansion_multiplier: 1.2, cost_reduction_multiplier: 1.3 },
];
