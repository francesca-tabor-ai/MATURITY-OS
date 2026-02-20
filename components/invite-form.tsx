'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function InviteForm({ organisationId }: { organisationId: string }) {
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`/api/organisations/${organisationId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: roleId || 'Analyst' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invite failed');
        setLoading(false);
        return;
      }
      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
      router.refresh();
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 mb-8 max-w-md">
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">Invite team member</h2>
      {error && <div className="mb-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-3 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>}
      <div className="flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="colleague@company.com"
            required
          />
        </div>
        <div className="w-40">
          <label className="block text-sm font-medium text-zinc-700 mb-1">Role</label>
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="input-field">
            <option value="Analyst">Analyst</option>
            <option value="Consultant">Consultant</option>
            <option value="Investor">Investor</option>
            <option value="Executive">Executive</option>
          </select>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Sending…' : 'Send invite'}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Without SendGrid configured, the invite link is logged in the server console for development.
      </p>
    </form>
  );
}
