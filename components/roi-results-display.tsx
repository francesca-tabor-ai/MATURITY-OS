'use client';

export interface ROIResultsDisplayProps {
  required_data_investment: number;
  required_ai_investment: number;
  total_investment: number;
  expected_roi_pct: number | null;
  expected_roi_multiplier: number | null;
  payback_period_years: number | null;
  payback_period_months: number | null;
  created_at?: string;
}

function formatCurrency(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(0)}`;
}

export function ROIResultsDisplay(props: ROIResultsDisplayProps) {
  const {
    required_data_investment,
    required_ai_investment,
    total_investment,
    expected_roi_pct,
    expected_roi_multiplier,
    payback_period_years,
    payback_period_months,
    created_at,
  } = props;

  const dataPct = total_investment > 0 ? (required_data_investment / total_investment) * 100 : 0;
  const aiPct = total_investment > 0 ? (required_ai_investment / total_investment) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-6">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Total investment</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{formatCurrency(total_investment)}</p>
        </div>
        <div className="glass-card p-6 text-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Expected ROI</p>
          {expected_roi_pct != null ? (
            <>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{expected_roi_pct.toFixed(1)}%</p>
              {expected_roi_multiplier != null && (
                <p className="mt-1 text-sm text-zinc-600">{expected_roi_multiplier.toFixed(2)}x</p>
              )}
            </>
          ) : (
            <p className="mt-2 text-zinc-500">—</p>
          )}
        </div>
        <div className="glass-card p-6">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Payback period</p>
          {payback_period_years != null && payback_period_years > 0 ? (
            <>
              <p className="mt-2 text-2xl font-bold text-blue-600">{payback_period_years.toFixed(1)} years</p>
              {payback_period_months != null && (
                <p className="mt-1 text-sm text-zinc-600">~{payback_period_months.toFixed(0)} months</p>
              )}
            </>
          ) : (
            <p className="mt-2 text-zinc-500">—</p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-zinc-900 mb-4">Investment breakdown</h3>
        <div className="flex gap-2 h-10 rounded-lg overflow-hidden bg-zinc-100">
          <div
            className="bg-indigo-500 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${dataPct}%` }}
          >
            {dataPct >= 20 ? 'Data' : ''}
          </div>
          <div
            className="bg-violet-500 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${aiPct}%` }}
          >
            {aiPct >= 20 ? 'AI' : ''}
          </div>
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <span className="text-zinc-600">Data infrastructure: {formatCurrency(required_data_investment)}</span>
          <span className="text-zinc-600">AI: {formatCurrency(required_ai_investment)}</span>
        </div>
      </div>

      {created_at && (
        <p className="text-sm text-zinc-500">Calculated {new Date(created_at).toLocaleString()}</p>
      )}
    </div>
  );
}
