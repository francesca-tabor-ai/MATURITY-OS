'use client';

export interface FinancialImpactResult {
  revenue_upside: number;
  profit_margin_expansion_pct?: number;
  profit_margin_expansion_value?: number;
  cost_reduction: number;
  details?: { revenue_upside_pct?: number };
  revenue_input?: number;
  created_at?: string;
}

function formatCurrency(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(0)}`;
}

export function FinancialImpactDashboard({ result }: { result: FinancialImpactResult }) {
  const revenueUpside = result.revenue_upside ?? 0;
  const marginValue = result.profit_margin_expansion_value ?? 0;
  const costReduction = result.cost_reduction ?? 0;
  const totalImpact = revenueUpside + marginValue + costReduction;
  const upsidePct = result.details?.revenue_upside_pct;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-6">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Revenue upside potential</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(revenueUpside)}</p>
          {upsidePct != null && (
            <p className="mt-1 text-sm text-zinc-600">~{upsidePct.toFixed(1)}% of revenue</p>
          )}
        </div>
        <div className="glass-card p-6">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Profit margin expansion</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(marginValue)}</p>
          {result.profit_margin_expansion_pct != null && (
            <p className="mt-1 text-sm text-zinc-600">+{result.profit_margin_expansion_pct.toFixed(1)} pp</p>
          )}
        </div>
        <div className="glass-card p-6">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Cost reduction potential</p>
          <p className="mt-2 text-2xl font-bold text-violet-600">{formatCurrency(costReduction)}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-zinc-900 mb-4">Impact breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-zinc-700">Revenue upside</span>
            <span className="font-medium text-emerald-600">{formatCurrency(revenueUpside)}</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: totalImpact > 0 ? `${(revenueUpside / totalImpact) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-700">Margin expansion (value)</span>
            <span className="font-medium text-blue-600">{formatCurrency(marginValue)}</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: totalImpact > 0 ? `${(marginValue / totalImpact) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-700">Cost reduction</span>
            <span className="font-medium text-violet-600">{formatCurrency(costReduction)}</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full"
              style={{ width: totalImpact > 0 ? `${(costReduction / totalImpact) * 100}%` : '0%' }}
            />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-200 flex justify-between items-center">
          <span className="font-semibold text-zinc-900">Total potential impact</span>
          <span className="text-xl font-bold text-zinc-900">{formatCurrency(totalImpact)}</span>
        </div>
      </div>

      {result.created_at && (
        <p className="text-sm text-zinc-500">Calculated {new Date(result.created_at).toLocaleString()}</p>
      )}
    </div>
  );
}
