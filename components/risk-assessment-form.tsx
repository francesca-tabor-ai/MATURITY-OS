'use client';

import { useState } from 'react';
import type { RiskAssessmentInputs } from '@/lib/risk-assessment-types';

export function RiskAssessmentForm({
  organisationId,
  onSuccess,
}: {
  organisationId: string;
  onSuccess: (result: Record<string, unknown>) => void;
}) {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<RiskAssessmentInputs>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = ['AI Misalignment', 'Infrastructure', 'Operational', 'Strategic'];

  function update(path: string, value: unknown) {
    setInputs((p) => ({ ...p, [path]: value }));
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/organisations/${organisationId}/risk-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Assessment failed');
      onSuccess(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assessment failed');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap border-b border-zinc-200 pb-2">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${step === i ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="glass-card p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">AI Misalignment Risk</h3>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">AI maturity score (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={inputs.ai_misalignment?.ai_maturity_score ?? ''}
                onChange={(e) => update('ai_misalignment', { ...inputs.ai_misalignment, ai_maturity_score: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field w-24"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Strategic goals alignment</label>
              <select
                value={inputs.ai_misalignment?.strategic_goals_alignment ?? ''}
                onChange={(e) => update('ai_misalignment', { ...inputs.ai_misalignment, strategic_goals_alignment: e.target.value || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">AI projects governance</label>
              <select
                value={inputs.ai_misalignment?.ai_projects_governance ?? ''}
                onChange={(e) => update('ai_misalignment', { ...inputs.ai_misalignment, ai_projects_governance: e.target.value || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="ad_hoc">Ad-hoc</option>
                <option value="defined">Defined</option>
                <option value="governed">Governed</option>
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!inputs.ai_misalignment?.ai_ethics_framework}
                onChange={(e) => update('ai_misalignment', { ...inputs.ai_misalignment, ai_ethics_framework: e.target.checked })}
              />
              AI ethics framework in place
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Infrastructure Risk</h3>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Cloud vs on-premise</label>
              <select
                value={inputs.infrastructure?.cloud_vs_on_prem ?? ''}
                onChange={(e) => update('infrastructure', { ...inputs.infrastructure, cloud_vs_on_prem: e.target.value || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="cloud">Cloud</option>
                <option value="hybrid">Hybrid</option>
                <option value="on_premise">On-premise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Integration complexity</label>
              <select
                value={inputs.infrastructure?.integration_complexity ?? ''}
                onChange={(e) => update('infrastructure', { ...inputs.infrastructure, integration_complexity: e.target.value || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Cybersecurity rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={inputs.infrastructure?.cybersecurity_rating ?? ''}
                onChange={(e) => update('infrastructure', { ...inputs.infrastructure, cybersecurity_rating: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field w-20"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Backup & recovery</label>
              <select
                value={inputs.infrastructure?.backup_recovery ?? ''}
                onChange={(e) => update('infrastructure', { ...inputs.infrastructure, backup_recovery: e.target.value || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="basic">Basic</option>
                <option value="tested">Tested</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Operational Risk</h3>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Data governance</label>
              <select
                value={inputs.operational?.data_governance ?? ''}
                onChange={(e) => update('operational', { ...inputs.operational, data_governance: e.target.value || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="basic">Basic</option>
                <option value="mature">Mature</option>
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!inputs.operational?.data_quality_controls}
                onChange={(e) => update('operational', { ...inputs.operational, data_quality_controls: e.target.checked })}
              />
              Data quality controls in place
            </label>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Team skills rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={inputs.operational?.team_skills_rating ?? ''}
                onChange={(e) => update('operational', { ...inputs.operational, team_skills_rating: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field w-20"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Incident response</label>
              <select
                value={inputs.operational?.incident_response ?? ''}
                onChange={(e) => update('operational', { ...inputs.operational, incident_response: e.target.value || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="reactive">Reactive</option>
                <option value="proactive">Proactive</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Strategic Risk</h3>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Industry benchmark gap (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={inputs.strategic?.industry_benchmark_gap ?? ''}
                onChange={(e) => update('strategic', { ...inputs.strategic, industry_benchmark_gap: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field w-24"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Regulatory compliance</label>
              <select
                value={inputs.strategic?.regulatory_compliance ?? ''}
                onChange={(e) => update('strategic', { ...inputs.strategic, regulatory_compliance: e.target.value || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="at_risk">At risk</option>
                <option value="compliant">Compliant</option>
                <option value="leading">Leading</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Competitive data/AI posture</label>
              <select
                value={inputs.strategic?.competitive_data_ai_posture ?? ''}
                onChange={(e) => update('strategic', { ...inputs.strategic, competitive_data_ai_posture: e.target.value || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="behind">Behind</option>
                <option value="par">On par</option>
                <option value="ahead">Ahead</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Data/AI maturity combined (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={inputs.strategic?.data_ai_maturity_combined ?? ''}
                onChange={(e) => update('strategic', { ...inputs.strategic, data_ai_maturity_combined: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field w-24"
              />
            </div>
          </div>
        )}
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="input-field border-zinc-300 disabled:opacity-50"
        >
          Previous
        </button>
        {step < steps.length - 1 ? (
          <button type="button" onClick={() => setStep((s) => s + 1)} className="btn-primary">
            Next
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary">
            {loading ? 'Assessing…' : 'Run risk assessment'}
          </button>
        )}
      </div>
    </div>
  );
}
