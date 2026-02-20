'use client';

import { useState } from 'react';
import type {
  DataCollectionInput,
  DataStorageInput,
  DataIntegrationInput,
  DataGovernanceInput,
  DataAccessibilityInput,
  AuditInputs,
} from '@/lib/data-maturity-types';

const STEPS = [
  { id: 'collection', label: 'Data Collection' },
  { id: 'storage', label: 'Data Storage' },
  { id: 'integration', label: 'Data Integration' },
  { id: 'governance', label: 'Data Governance' },
  { id: 'accessibility', label: 'Data Accessibility' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

export function DataAuditForm({
  organisationId,
  onSuccess,
}: {
  organisationId: string;
  onSuccess: (result: Record<string, unknown>) => void;
}) {
  const [step, setStep] = useState<number>(0);
  const [auditPeriod, setAuditPeriod] = useState('');
  const [inputs, setInputs] = useState<AuditInputs>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const stepId = STEPS[step].id;

  function updateCollection(partial: Partial<DataCollectionInput>) {
    setInputs((p) => ({ ...p, collection: { ...p.collection, ...partial } }));
  }
  function updateStorage(partial: Partial<DataStorageInput>) {
    setInputs((p) => ({ ...p, storage: { ...p.storage, ...partial } }));
  }
  function updateIntegration(partial: Partial<DataIntegrationInput>) {
    setInputs((p) => ({ ...p, integration: { ...p.integration, ...partial } }));
  }
  function updateGovernance(partial: Partial<DataGovernanceInput>) {
    setInputs((p) => ({ ...p, governance: { ...p.governance, ...partial } }));
  }
  function updateAccessibility(partial: Partial<DataAccessibilityInput>) {
    setInputs((p) => ({ ...p, accessibility: { ...p.accessibility, ...partial } }));
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/organisations/${organisationId}/data-audit`, {
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
        {stepId === 'collection' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Data Collection</h3>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Data sources identified (count)</label>
              <input
                type="number"
                min={0}
                value={inputs.collection?.data_sources_identified ?? ''}
                onChange={(e) => updateCollection({ data_sources_identified: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field max-w-[120px]"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Structured data %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={inputs.collection?.structured_data_pct ?? ''}
                onChange={(e) => updateCollection({ structured_data_pct: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field max-w-[120px]"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Data completeness score (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={inputs.collection?.data_completeness_score ?? ''}
                onChange={(e) => updateCollection({ data_completeness_score: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field max-w-[120px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="automated"
                checked={inputs.collection?.automated_collection ?? false}
                onChange={(e) => updateCollection({ automated_collection: e.target.checked })}
              />
              <label htmlFor="automated">Automated collection</label>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Collection frequency</label>
              <select
                value={inputs.collection?.collection_frequency ?? ''}
                onChange={(e) => updateCollection({ collection_frequency: e.target.value as DataCollectionInput['collection_frequency'] || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="real-time">Real-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="ad-hoc">Ad-hoc</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        )}

        {stepId === 'storage' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Data Storage</h3>
            <div>
              <label className="block text-sm text-zinc-600 mb-2">Storage types used</label>
              {['spreadsheets', 'database', 'warehouse', 'lakehouse', 'data_lake'].map((t) => (
                <label key={t} className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={inputs.storage?.storage_types?.includes(t as never) ?? false}
                    onChange={(e) => {
                      const current = inputs.storage?.storage_types ?? [];
                      const next = e.target.checked ? [...current, t] : current.filter((x) => x !== t);
                      updateStorage({ storage_types: next as DataStorageInput['storage_types'] });
                    }}
                  />
                  {t.replace('_', ' ')}
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Cloud vs on-premise</label>
              <select
                value={inputs.storage?.cloud_vs_on_prem ?? ''}
                onChange={(e) => updateStorage({ cloud_vs_on_prem: e.target.value as DataStorageInput['cloud_vs_on_prem'] || undefined })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="cloud">Cloud</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-premise">On-premise</option>
              </select>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inputs.storage?.real_time_processing ?? false}
                  onChange={(e) => updateStorage({ real_time_processing: e.target.checked })}
                />
                Real-time processing
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inputs.storage?.batch_processing ?? false}
                  onChange={(e) => updateStorage({ batch_processing: e.target.checked })}
                />
                Batch processing
              </label>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md">
              {(['scalability_rating', 'security_rating', 'accessibility_rating'] as const).map((key) => (
                <div key={key}>
                  <label className="block text-sm text-zinc-600 mb-1">{key.replace('_', ' ')} (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={inputs.storage?.[key] ?? ''}
                    onChange={(e) => updateStorage({ [key]: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    className="input-field w-20"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {stepId === 'integration' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Data Integration</h3>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Integrated systems count</label>
              <input
                type="number"
                min={0}
                value={inputs.integration?.integrated_systems_count ?? ''}
                onChange={(e) => updateIntegration({ integrated_systems_count: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field max-w-[120px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="api_available"
                checked={inputs.integration?.api_available ?? false}
                onChange={(e) => updateIntegration({ api_available: e.target.checked })}
              />
              <label htmlFor="api_available">API available</label>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Pipeline maturity</label>
              <select
                value={inputs.integration?.pipeline_maturity ?? ''}
                onChange={(e) => updateIntegration({ pipeline_maturity: (e.target.value || undefined) as DataIntegrationInput['pipeline_maturity'] })}
                className="input-field max-w-[220px]"
              >
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="manual">Manual</option>
                <option value="semi-automated">Semi-automated</option>
                <option value="fully-automated">Fully automated</option>
              </select>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inputs.integration?.etl_elt_process ?? false}
                  onChange={(e) => updateIntegration({ etl_elt_process: e.target.checked })}
                />
                ETL/ELT process
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inputs.integration?.data_quality_checks ?? false}
                  onChange={(e) => updateIntegration({ data_quality_checks: e.target.checked })}
                />
                Data quality checks
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inputs.integration?.real_time_sync ?? false}
                  onChange={(e) => updateIntegration({ real_time_sync: e.target.checked })}
                />
                Real-time sync
              </label>
            </div>
          </div>
        )}

        {stepId === 'governance' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Data Governance</h3>
            <div className="flex flex-col gap-2">
              {[
                { key: 'data_ownership_defined' as const, label: 'Data ownership defined' },
                { key: 'data_quality_controls' as const, label: 'Data quality controls' },
                { key: 'policies_documented' as const, label: 'Policies documented' },
                { key: 'data_catalog' as const, label: 'Data catalog' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inputs.governance?.[key] ?? false}
                    onChange={(e) => updateGovernance({ [key]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Metadata management</label>
              <select
                value={inputs.governance?.metadata_management ?? ''}
                onChange={(e) => updateGovernance({ metadata_management: (e.target.value || undefined) as DataGovernanceInput['metadata_management'] })}
                className="input-field max-w-[200px]"
              >
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Compliance framework (optional)</label>
              <input
                type="text"
                value={inputs.governance?.compliance_framework ?? ''}
                onChange={(e) => updateGovernance({ compliance_framework: e.target.value || null })}
                className="input-field max-w-xs"
                placeholder="e.g. GDPR, SOC 2"
              />
            </div>
          </div>
        )}

        {stepId === 'accessibility' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-900">Data Accessibility</h3>
            <div className="flex flex-col gap-2">
              {[
                { key: 'self_service_analytics' as const, label: 'Self-service analytics' },
                { key: 'real_time_data_access' as const, label: 'Real-time data access' },
                { key: 'cross_functional_access' as const, label: 'Cross-functional access' },
                { key: 'role_based_access' as const, label: 'Role-based access' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inputs.accessibility?.[key] ?? false}
                    onChange={(e) => updateAccessibility({ [key]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-1">Access rating (1–5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={inputs.accessibility?.access_rating ?? ''}
                onChange={(e) => updateAccessibility({ access_rating: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="input-field w-20"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 mb-2">Reporting tools</label>
              {(['none', 'spreadsheets', 'bi_tools', 'embedded'] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    checked={inputs.accessibility?.reporting_tools?.includes(t) ?? false}
                    onChange={(e) => {
                      const current = inputs.accessibility?.reporting_tools ?? [];
                      const next = e.target.checked ? [...current, t] : current.filter((x) => x !== t);
                      updateAccessibility({ reporting_tools: next });
                    }}
                  />
                  {t.replace('_', ' ')}
                </label>
              ))}
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
