'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateOrganisationForm() {
  const [name, setName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [revenue, setRevenue] = useState('');
  const [geography, setGeography] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/organisations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          company_size: companySize || undefined,
          industry: industry || undefined,
          revenue: revenue || undefined,
          geography: geography || undefined,
          employee_count: employeeCount ? parseInt(employeeCount, 10) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create');
        setLoading(false);
        return;
      }
      router.push(`/dashboard/organisations/${data.id}`);
      router.refresh();
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 max-w-lg space-y-4">
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Organisation name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          required
          placeholder="Acme Inc"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Company size</label>
        <select
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
          className="input-field"
        >
          <option value="">Select</option>
          <option value="startup">Startup</option>
          <option value="smb">SMB</option>
          <option value="mid-market">Mid-market</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Industry</label>
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="input-field"
          placeholder="e.g. Technology, Finance"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Revenue</label>
        <input
          type="text"
          value={revenue}
          onChange={(e) => setRevenue(e.target.value)}
          className="input-field"
          placeholder="e.g. $10M–$50M"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Geography</label>
        <input
          type="text"
          value={geography}
          onChange={(e) => setGeography(e.target.value)}
          className="input-field"
          placeholder="e.g. North America"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Employee count</label>
        <input
          type="number"
          min={0}
          value={employeeCount}
          onChange={(e) => setEmployeeCount(e.target.value)}
          className="input-field"
          placeholder="e.g. 150"
        />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Creating…' : 'Create organisation'}
      </button>
    </form>
  );
}
