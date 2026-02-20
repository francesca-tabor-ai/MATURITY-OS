'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

type User = { email?: string | null; name?: string | null; role?: string };

export function DashboardNav({ user }: { user: User }) {
  return (
    <nav className="flex items-center gap-4">
      <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900 text-sm">
        Dashboard
      </Link>
      <Link href="/dashboard/organisations" className="text-zinc-600 hover:text-zinc-900 text-sm">
        Organisations
      </Link>
      <span className="text-sm text-zinc-500">
        {user.role && <span className="rounded bg-zinc-200 px-2 py-0.5">{user.role}</span>}
        {user.email && <span className="ml-2">{user.email}</span>}
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        Sign out
      </button>
    </nav>
  );
}
