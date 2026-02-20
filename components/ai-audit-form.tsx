'use client';

import { useState } from 'react';
import type { AutomationInput, AIUsageInput, DeploymentInput, AIAuditInputs } from '@/lib/ai-maturity-types';

const STEPS = [
  { id: 'automation', label: 'Automation Maturity' },
  { id: 'ai_usage', label: 'AI Usage' },
  { id: 'deployment', label: 'Deployment Maturity' },
] as const;

export function AIAuditForm({
  organisationId,
  onSuccess,
}: {
  organisationId: string;
  onSuccess: (result: Record<string, unknown>) => void;
}) {
  const [step, setStep] = useState(0);
  const [auditPeriod, setAuditPeriod] = useState('');
  const [inputs, setInputs] = useState<AIAuditInputs>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const stepId = STEPS[step].id;

  function updateAutomation(partial: Partial<AutomationInput>) {
    setInputs((p) => ({ ...p, automation: { ...p.automation, ...partial } }));
  }
  function updateAIUsage(partial: Partial<AIUsageInput>) {
    setInputs((p) => ({ ...p, ai_usage: { ...p.ai_usage, ...partial } }));
  }
  function updateDeployment(partial: Partial<DeploymentInput>) {
    setInputs((p) => ({ ...p, deployment: { ...p.deployment, ...partial } }));
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/organisations/${organisationId}/ai-audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audit_period: auditPeriod || undefined,
          ...inputs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      onSuccess(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Audit failed');
    }
    setLoading(false);
  }

  const impactOptions = [
    { value: 'none', label: 'None' },
    { value: 'pilot', label: 'Pilot' },
    { value: 'departmental', label: 'Departmental' },
    { value: 'enterprise', label: 'Enterprise' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Audit period (optional)</label>
        <input
          type="text"
          value={auditPeriod}
          onChange={(e) => setAuditPeriod(e.target.value)}
          className="input-field max-w-xs"
          placeholder="e.g. Q1 2025"
        />
      </div>

      <div className="flex gap-2 flex-wrap border-b border-zinc-200 pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              step === i ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="glass-card p-6">
        {stepId === 'automation' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Automation Maturity</h3>
            <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Automated workflow %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={inputs.automation?.automated_workflow_pct ?? ''}
                  onChange={(e) => updateAutomation({ automated_workflow_pct: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  className="input-field w-24"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Process automation count</label>
                <input
                  type="number"
                  min={0}
                  value={inputs.automation?.process_automation_count ?? ''}
                  onChange={(e) => updateAutomation({ process_automation_count: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  className="input-field w-24"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Workflow automation level</label>
              <select
                value={inputs.automation?.workflow_automation_level ?? ''}
                onChange={(e) => updateAutomation({ workflow_automation_level: (e.target.value || undefined) as AutomationInput['workflow_automation_level'] })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="basic">Basic</option>
                <option value="moderate">Moderate</option>
                <option value="advanced">Advanced</option>
                <option value="full">Full</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={inputs.automation?.rule_based_automation ?? false}
                onChange={(e) => updateAutomation({ rule_based_automation: e.target.checked })}
              />
              <label>Rule-based automation in place</label>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Sophistication rating (1–5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={inputs.automation?.sophistication_rating ?? ''}
                onChange={(e) => updateAutomation({ sophistication_rating: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field w-20"
              />
            </div>
          </div>
        )}

        {stepId === 'ai_usage' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">AI Usage</h3>
            {[
              { key: 'predictive_models' as const, impactKey: 'predictive_models_impact' as const, label: 'Predictive models' },
              { key: 'recommendation_systems' as const, impactKey: 'recommendation_impact' as const, label: 'Recommendation systems' },
              { key: 'nlp_usage' as const, impactKey: 'nlp_impact' as const, label: 'NLP' },
              { key: 'computer_vision' as const, impactKey: 'computer_vision_impact' as const, label: 'Computer vision' },
            ].map(({ key, impactKey, label }) => (
              <div key={key} className="flex flex-wrap items-center gap-3 py-2 border-b border-zinc-100 last:border-0">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inputs.ai_usage?.[key] ?? false}
                    onChange={(e) => updateAIUsage({ [key]: e.target.checked })}
                  />
                  {label}
                </label>
                <select
                  value={inputs.ai_usage?.[impactKey] ?? ''}
                  onChange={(e) => updateAIUsage({ [impactKey]: (e.target.value || undefined) as AIUsageInput[typeof impactKey] })}
                  className="input-field w-36 text-sm"
                >
                  <option value="">Impact</option>
                  {impactOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="grid gap-4 sm:grid-cols-2 max-w-md pt-2">
              <div>
                <label className="block text-sm text-zinc-600 mb-1">AI breadth rating (1–5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={inputs.ai_usage?.ai_breadth_rating ?? ''}
                  onChange={(e) => updateAIUsage({ ai_breadth_rating: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  className="input-field w-20"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-1">AI integration rating (1–5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={inputs.ai_usage?.ai_integration_rating ?? ''}
                  onChange={(e) => updateAIUsage({ ai_integration_rating: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  className="input-field w-20"
                />
              </div>
            </div>
          </div>
        )}

        {stepId === 'deployment' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Deployment Maturity</h3>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Deployment mode</label>
              <select
                value={inputs.deployment?.deployment_mode ?? ''}
                onChange={(e) => updateDeployment({ deployment_mode: (e.target.value || undefined) as DeploymentInput['deployment_mode'] })}
                className="input-field max-w-[220px]"
              >
                <option value="">Select</option>
                <option value="experimental">Experimental</option>
                <option value="pilot">Pilot</option>
                <option value="production">Production</option>
                <option value="enterprise_wide">Enterprise-wide</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Scope</label>
              <select
                value={inputs.deployment?.scope ?? ''}
                onChange={(e) => updateDeployment({ scope: (e.target.value || undefined) as DeploymentInput['scope'] })}
                className="input-field max-w-[220px]"
              >
                <option value="">Select</option>
                <option value="isolated">Isolated</option>
                <option value="departmental">Departmental</option>
                <option value="cross_functional">Cross-functional</option>
                <option value="enterprise_wide">Enterprise-wide</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Decision automation</label>
              <select
                value={inputs.deployment?.decision_automation ?? ''}
                onChange={(e) => updateDeployment({ decision_automation: (e.target.value || undefined) as DeploymentInput['decision_automation'] })}
                className="input-field max-w-[220px]"
              >
                <option value="">Select</option>
                <option value="human_only">Human only</option>
                <option value="human_in_loop">Human-in-the-loop</option>
                <option value="assisted">Assisted</option>
                <option value="fully_autonomous">Fully autonomous</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Production workloads count</label>
              <input
                type="number"
                min={0}
                value={inputs.deployment?.production_workloads_count ?? ''}
                onChange={(e) => updateDeployment({ production_workloads_count: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field w-24"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 max-w-md">
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Scalability rating (1–5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={inputs.deployment?.scalability_rating ?? ''}
                  onChange={(e) => updateDeployment({ scalability_rating: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  className="input-field w-20"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Reliability rating (1–5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={inputs.deployment?.reliability_rating ?? ''}
                  onChange={(e) => updateDeployment({ reliability_rating: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  className="input-field w-20"
                />
              </div>
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
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => setStep((s) => s + 1)} className="btn-primary">
            Next
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary">
            {loading ? 'Running audit…' : 'Run audit'}
          </button>
        )}
      </div>
    </div>
  );
}
