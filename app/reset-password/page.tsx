'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ResetForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!token) {
      setError('Missing reset token');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Reset failed');
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="glass-card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Invalid link</h1>
        <p className="text-zinc-600 mb-6">This reset link is invalid or missing. Request a new one.</p>
        <Link href="/forgot-password" className="text-indigo-600 hover:underline">Request new link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-card w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Password updated</h1>
        <p className="text-zinc-600 mb-6">You can now sign in with your new password.</p>
        <Link href="/login" className="btn-primary inline-block">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="glass-card w-full max-w-md p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Set new password</h1>
      <p className="text-zinc-600 mb-6">Choose a secure password (min 8 characters).</p>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-field"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100">
      <Suspense fallback={<div className="glass-card w-full max-w-md p-8">Loading…</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
