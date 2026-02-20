'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

function AcceptContent() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'accepted' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const token = searchParams.get('token');

  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !token || status !== 'idle') return;
    setStatus('loading');
    fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setStatus('accepted');
          setMessage(data.organisationId ? 'You have joined the organisation.' : 'Done.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Invalid or expired invitation.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong.');
      });
  }, [token, sessionStatus, status]);

  if (sessionStatus === 'loading' || (sessionStatus === 'unauthenticated' && status === 'idle')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <p className="text-zinc-600">Loading…</p>
          {sessionStatus === 'unauthenticated' && (
            <Link href={`/login?callbackUrl=${encodeURIComponent('/invite/accept?token=' + (token ?? ''))}`} className="mt-4 inline-block text-indigo-600 hover:underline">
              Sign in to accept
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Sign in required</h1>
          <p className="text-zinc-600 mb-6">Sign in to accept this invitation.</p>
          <Link href={`/login?callbackUrl=${encodeURIComponent('/invite/accept?token=' + (token ?? ''))}`} className="btn-primary inline-block">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <p className="text-zinc-600">Accepting invitation…</p>
        </div>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">You’re in</h1>
          <p className="text-zinc-600 mb-6">{message}</p>
          <Link href="/dashboard" className="btn-primary inline-block">Go to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100">
      <div className="glass-card w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Invitation failed</h1>
        <p className="text-zinc-600 mb-6">{message}</p>
        <Link href="/dashboard" className="text-indigo-600 hover:underline">Back to dashboard</Link>
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-100">
        <div className="glass-card w-full max-w-md p-8 text-center"><p className="text-zinc-600">Loading…</p></div>
      </div>
    }>
      <AcceptContent />
    </Suspense>
  );
}
