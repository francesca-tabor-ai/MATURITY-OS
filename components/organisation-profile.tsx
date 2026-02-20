'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Org = {
  id: string;
  name: string;
  slug: string | null;
  company_size: string | null;
  industry: string | null;
  revenue: string | null;
  geography: string | null;
  employee_count: number | null;
  metadata?: Record<string, unknown>;
};

export function OrganisationProfile({ org }: { org: Org }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(org.name);
  const [companySize, setCompanySize] = useState(org.company_size ?? '');
  const [industry, setIndustry] = useState(org.industry ?? '');
  const [revenue, setRevenue] = useState(org.revenue ?? '');
  const [geography, setGeography] = useState(org.geography ?? '');
  const [employeeCount, setEmployeeCount] = useState(org.employee_count?.toString() ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/organisations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          company_size: companySize || null,
          industry: industry || null,
          revenue: revenue || null,
          geography: geography || null,
          employee_count: employeeCount ? parseInt(employeeCount, 10) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Update failed');
        setLoading(false);
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="glass-card p-6 max-w-lg space-y-4">
        {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Company size</label>
          <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className="input-field">
            <option value="">Select</option>
            <option value="startup">Startup</option>
            <option value="smb">SMB</option>
            <option value="mid-market">Mid-market</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Industry</label>
          <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Revenue</label>
          <input type="text" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Geography</label>
          <input type="text" value={geography} onChange={(e) => setGeography(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Employee count</label>
          <input
            type="number"
            min={0}
            value={employeeCount}
            onChange={(e) => setEmployeeCount(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="input-field border-zinc-300">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="glass-card p-6 max-w-lg">
      <dl className="grid gap-3">
        <div>
          <dt className="text-sm text-zinc-500">Name</dt>
          <dd className="font-medium text-zinc-900">{org.name}</dd>
        </div>
        {org.company_size && (
          <div>
            <dt className="text-sm text-zinc-500">Company size</dt>
            <dd className="text-zinc-900">{org.company_size}</dd>
          </div>
        )}
        {org.industry && (
          <div>
            <dt className="text-sm text-zinc-500">Industry</dt>
            <dd className="text-zinc-900">{org.industry}</dd>
          </div>
        )}
        {org.revenue && (
          <div>
            <dt className="text-sm text-zinc-500">Revenue</dt>
            <dd className="text-zinc-900">{org.revenue}</dd>
          </div>
        )}
        {org.geography && (
          <div>
            <dt className="text-sm text-zinc-500">Geography</dt>
            <dd className="text-zinc-900">{org.geography}</dd>
          </div>
        )}
        {org.employee_count != null && (
          <div>
            <dt className="text-sm text-zinc-500">Employee count</dt>
            <dd className="text-zinc-900">{org.employee_count}</dd>
          </div>
        )}
      </dl>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-4 text-sm text-indigo-600 hover:underline"
      >
        Edit profile
      </button>
    </div>
  );
}
