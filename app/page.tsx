import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold signature-text-gradient mb-4">MATURITY OS™</h1>
        <p className="text-zinc-600 mb-8">You are signed in as {session.user?.email}</p>
        <Link href="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold signature-text-gradient mb-4">MATURITY OS™</h1>
      <p className="text-zinc-600 mb-8">Identity & Organisation Management</p>
      <div className="flex gap-4">
        <Link href="/login" className="btn-primary">
          Sign in
        </Link>
        <Link href="/register" className="input-field border-zinc-900 text-center hover:bg-zinc-100">
          Register
        </Link>
      </div>
    </div>
  );
}
