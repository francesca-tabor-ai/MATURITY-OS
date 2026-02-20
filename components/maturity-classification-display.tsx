'use client';

import type { ClassificationResult } from '@/lib/maturity-classification-types';

export interface MaturityClassificationDisplayProps {
  classification_string: string;
  matrix_x_coordinate: number;
  matrix_y_coordinate: number;
  risk_classification: string;
  opportunity_classification: string;
  created_at?: string;
}

export function MaturityClassificationDisplay(props: MaturityClassificationDisplayProps) {
  const {
    classification_string,
    matrix_x_coordinate,
    matrix_y_coordinate,
    risk_classification,
    opportunity_classification,
    created_at,
  } = props;

  const riskColor =
    risk_classification === 'Low'
      ? 'bg-emerald-100 text-emerald-800'
      : risk_classification === 'Medium'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-red-100 text-red-800';

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-2">Classification</h3>
        <p className="text-2xl font-bold text-zinc-900">{classification_string}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-2">Matrix position</h3>
          <p className="text-zinc-900">
            <span className="font-medium">X (Data):</span> {matrix_x_coordinate.toFixed(1)}
          </p>
          <p className="text-zinc-900 mt-1">
            <span className="font-medium">Y (AI):</span> {matrix_y_coordinate.toFixed(1)}
          </p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-2">Risk</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${riskColor}`}>
            {risk_classification}
          </span>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-2">Opportunity</h3>
        <p className="text-lg font-medium text-zinc-900">{opportunity_classification}</p>
      </div>

      {created_at && (
        <p className="text-sm text-zinc-500">Classified {new Date(created_at).toLocaleString()}</p>
      )}
    </div>
  );
}
