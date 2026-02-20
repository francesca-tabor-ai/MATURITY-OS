'use client';

export interface RiskAssessmentDisplayProps {
  overall_risk_score: number;
  risk_level: string;
  ai_misalignment_risk_score: number;
  infrastructure_risk_score: number;
  operational_risk_score: number;
  strategic_risk_score: number;
  summary?: string[];
  created_at?: string;
}

const CATEGORIES = [
  { key: 'ai_misalignment_risk_score', label: 'AI Misalignment' },
  { key: 'infrastructure_risk_score', label: 'Infrastructure' },
  { key: 'operational_risk_score', label: 'Operational' },
  { key: 'strategic_risk_score', label: 'Strategic' },
] as const;

function riskColor(score: number): string {
  if (score < 35) return 'bg-emerald-500';
  if (score < 65) return 'bg-amber-500';
  return 'bg-red-500';
}

function levelColor(level: string): string {
  if (level === 'LOW') return 'bg-emerald-100 text-emerald-800';
  if (level === 'MEDIUM') return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function RiskAssessmentDisplay(props: RiskAssessmentDisplayProps) {
  const { overall_risk_score, risk_level, summary, created_at } = props;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-6 text-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Overall risk score</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgb(228 228 231)"
                  strokeWidth="2.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={overall_risk_score < 35 ? '#10b981' : overall_risk_score < 65 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="2.5"
                  strokeDasharray={`${overall_risk_score}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-zinc-900">
                {overall_risk_score}
              </span>
            </div>
          </div>
          <p className="mt-2 text-zinc-600 text-sm">0–100</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-center items-center">
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Risk level</p>
          <span className={`mt-3 inline-flex px-4 py-2 rounded-lg text-lg font-bold ${levelColor(risk_level)}`}>
            {risk_level}
          </span>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-zinc-900 mb-4">Category scores (risk heatmap)</h3>
        <div className="space-y-4">
          {CATEGORIES.map(({ key, label }) => {
            const value = props[key];
            const score = typeof value === 'number' ? Math.round(value) : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-zinc-700">{label}</span>
                  <span className="text-zinc-500">{score}</span>
                </div>
                <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-l-full ${riskColor(score)} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {summary && summary.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-zinc-900 mb-2">Summary</h3>
          <ul className="list-disc pl-5 space-y-1 text-zinc-700">
            {summary.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {created_at && (
        <p className="text-sm text-zinc-500">Assessed {new Date(created_at).toLocaleString()}</p>
      )}
    </div>
  );
}
