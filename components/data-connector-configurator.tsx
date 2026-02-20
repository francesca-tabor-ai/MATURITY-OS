'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ConnectorType, DataConnectorRecord } from '@/lib/data-connectors/types';

const CONNECTOR_LABELS: Record<ConnectorType, string> = {
  snowflake: 'Snowflake',
  aws: 'AWS',
  salesforce: 'Salesforce',
};

export function DataConnectorConfigurator({ organisationId }: { organisationId: string }) {
  const [connectors, setConnectors] = useState<DataConnectorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<ConnectorType>('snowflake');
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [syncId, setSyncId] = useState<string | null>(null);

  const fetchConnectors = useCallback(() => {
    setLoading(true);
    setError('');
    fetch(`/api/organisations/${organisationId}/data-connectors`)
      .then((r) => r.json())
      .then((data) => setConnectors(data.connectors ?? []))
      .catch(() => setError('Failed to load connectors'))
      .finally(() => setLoading(false));
  }, [organisationId]);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  const buildPayload = (): Record<string, unknown> => {
    if (activeTab === 'snowflake') {
      return {
        connector_type: 'snowflake',
        name: form.name || 'Snowflake',
        connection_details: {
          account: form.account || '',
          username: form.username || '',
          password: form.password || undefined,
          warehouse: form.warehouse || undefined,
          database: form.database || undefined,
          schema: form.schema || undefined,
          role: form.role || undefined,
        },
      };
    }
    if (activeTab === 'aws') {
      return {
        connector_type: 'aws',
        name: form.name || 'AWS',
        connection_details: {
          region: form.region || '',
          access_key_id: form.access_key_id || undefined,
          secret_access_key: form.secret_access_key || undefined,
          s3_buckets: form.s3_buckets ? form.s3_buckets.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          redshift_cluster: form.redshift_cluster || undefined,
        },
      };
    }
    return {
      connector_type: 'salesforce',
      name: form.name || 'Salesforce',
      connection_details: {
        instance_url: form.instance_url || '',
        client_id: form.client_id || undefined,
        client_secret: form.client_secret || undefined,
        refresh_token: form.refresh_token || undefined,
        access_token: form.access_token || undefined,
      },
    };
  };

  const validate = (): boolean => {
    if (activeTab === 'snowflake') return !!(form.account?.trim() && form.username?.trim());
    if (activeTab === 'aws') return !!form.region?.trim();
    if (activeTab === 'salesforce') return !!form.instance_url?.trim();
    return false;
  };

  const handleCreate = () => {
    if (!validate()) {
      setError('Fill required fields (account + username for Snowflake; region for AWS; instance URL for Salesforce).');
      return;
    }
    setSubmitLoading(true);
    setError('');
    fetch(`/api/organisations/${organisationId}/data-connectors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload()),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d.error || 'Create failed')));
        return r.json();
      })
      .then(() => {
        setForm({});
        fetchConnectors();
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setSubmitLoading(false));
  };

  const handleSync = (connectorId: string) => {
    setSyncId(connectorId);
    setError('');
    fetch(`/api/organisations/${organisationId}/data-connectors/${connectorId}/sync`, { method: 'POST' })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok) fetchConnectors();
        else setError(data?.error || 'Sync failed');
      })
      .catch(() => setError('Sync failed'))
      .finally(() => setSyncId(null));
  };

  const handleDelete = (connectorId: string) => {
    if (!confirm('Remove this connector?')) return;
    fetch(`/api/organisations/${organisationId}/data-connectors/${connectorId}`, { method: 'DELETE' })
      .then((r) => r.ok && fetchConnectors())
      .catch(() => setError('Delete failed'));
  };

  if (loading && connectors.length === 0) {
    return <div className="py-8 text-center text-zinc-500">Loading connectors…</div>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Add data connector</h3>
        <div className="flex gap-2 mb-4">
          {(['snowflake', 'aws', 'salesforce'] as ConnectorType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === t ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
            >
              {CONNECTOR_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-w-md">
          <label className="block text-sm font-medium text-zinc-700">Name (optional)</label>
          <input
            type="text"
            value={form.name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={CONNECTOR_LABELS[activeTab]}
            className="input-field"
          />

          {activeTab === 'snowflake' && (
            <>
              <label className="block text-sm font-medium text-zinc-700">Account *</label>
              <input
                type="text"
                value={form.account ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))}
                placeholder="xy12345.eu-west-1"
                className="input-field"
              />
              <label className="block text-sm font-medium text-zinc-700">Username *</label>
              <input
                type="text"
                value={form.username ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                className="input-field"
              />
              <label className="block text-sm font-medium text-zinc-700">Password</label>
              <input
                type="password"
                value={form.password ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Leave blank to keep existing"
                className="input-field"
              />
              <label className="block text-sm font-medium text-zinc-700">Warehouse / Database / Schema / Role</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={form.warehouse ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, warehouse: e.target.value }))}
                  placeholder="Warehouse"
                  className="input-field"
                />
                <input
                  type="text"
                  value={form.database ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, database: e.target.value }))}
                  placeholder="Database"
                  className="input-field"
                />
                <input
                  type="text"
                  value={form.schema ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, schema: e.target.value }))}
                  placeholder="Schema"
                  className="input-field"
                />
                <input
                  type="text"
                  value={form.role ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="Role"
                  className="input-field"
                />
              </div>
            </>
          )}

          {activeTab === 'aws' && (
            <>
              <label className="block text-sm font-medium text-zinc-700">Region *</label>
              <input
                type="text"
                value={form.region ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                placeholder="eu-west-1"
                className="input-field"
              />
              <label className="block text-sm font-medium text-zinc-700">Access key ID / Secret (optional)</label>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="password"
                  value={form.access_key_id ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, access_key_id: e.target.value }))}
                  placeholder="Access key ID"
                  className="input-field"
                />
                <input
                  type="password"
                  value={form.secret_access_key ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, secret_access_key: e.target.value }))}
                  placeholder="Secret access key"
                  className="input-field"
                />
              </div>
              <label className="block text-sm font-medium text-zinc-700">S3 buckets (comma-separated) / Redshift cluster</label>
              <input
                type="text"
                value={form.s3_buckets ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, s3_buckets: e.target.value }))}
                placeholder="bucket1, bucket2"
                className="input-field"
              />
              <input
                type="text"
                value={form.redshift_cluster ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, redshift_cluster: e.target.value }))}
                placeholder="Redshift cluster ID"
                className="input-field"
              />
            </>
          )}

          {activeTab === 'salesforce' && (
            <>
              <label className="block text-sm font-medium text-zinc-700">Instance URL *</label>
              <input
                type="url"
                value={form.instance_url ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, instance_url: e.target.value }))}
                placeholder="https://yourorg.my.salesforce.com"
                className="input-field"
              />
              <label className="block text-sm font-medium text-zinc-700">OAuth: Client ID / Secret / Refresh token</label>
              <input
                type="text"
                value={form.client_id ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                placeholder="Client ID"
                className="input-field"
              />
              <input
                type="password"
                value={form.client_secret ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, client_secret: e.target.value }))}
                placeholder="Client secret"
                className="input-field"
              />
              <input
                type="password"
                value={form.refresh_token ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, refresh_token: e.target.value }))}
                placeholder="Refresh token"
                className="input-field"
              />
            </>
          )}

          <button
            type="button"
            onClick={handleCreate}
            disabled={submitLoading}
            className="btn-primary mt-4"
          >
            {submitLoading ? 'Adding…' : 'Add connector'}
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Configured connectors</h3>
        {connectors.length === 0 ? (
          <p className="text-zinc-500 text-sm">No connectors yet. Add one above.</p>
        ) : (
          <ul className="space-y-3">
            {connectors.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3"
              >
                <div>
                  <span className="font-medium text-zinc-900">{c.name}</span>
                  <span className="ml-2 text-xs text-zinc-500">{CONNECTOR_LABELS[c.connector_type]}</span>
                  {c.last_sync_at && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Last sync: {new Date(c.last_sync_at).toLocaleString()}
                      {c.last_sync_status === 'ok' && <span className="text-emerald-600 ml-1">✓</span>}
                      {c.last_sync_status === 'failed' && <span className="text-red-600 ml-1">Failed</span>}
                    </p>
                  )}
                  {c.last_sync_error && <p className="text-xs text-red-600 mt-0.5">{c.last_sync_error}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSync(c.id)}
                    disabled={syncId === c.id}
                    className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
                  >
                    {syncId === c.id ? 'Syncing…' : 'Sync now'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
