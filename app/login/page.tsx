'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', { email, password, redirect: false, callbackUrl });
      if (res?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100">
      <div className="glass-card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Sign in</h1>
        <p className="text-zinc-600 mb-6">MATURITY OS™</p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-zinc-200">
          <p className="text-sm text-zinc-600 mb-3">Or continue with</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-300 rounded-xl hover:bg-zinc-50"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => signIn('github', { callbackUrl })}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-300 rounded-xl hover:bg-zinc-50"
            >
              GitHub
            </button>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-zinc-600">
          No account? <Link href="/register" className="text-indigo-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100"><div className="glass-card w-full max-w-md p-8">Loading…</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
