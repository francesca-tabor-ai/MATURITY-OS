import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const orgs = await query<{ id: string; name: string; slug: string | null; role_name: string }>(
    `SELECT o.id, o.name, o.slug, r.name AS role_name
     FROM user_organisations uo
     JOIN organisations o ON o.id = uo.organisation_id
     JOIN roles r ON r.id = uo.role_id
     WHERE uo.user_id = $1 ORDER BY uo.is_default DESC, o.name`,
    [session.user.id]
  );
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Dashboard</h1>
      <p className="text-zinc-600 mb-8">Your organisations</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orgs.map((org) => (
          <Link
            key={org.id}
            href={`/dashboard/organisations/${org.id}`}
            className="glass-card p-6 block hover:shadow-md transition-shadow"
          >
            <h2 className="font-semibold text-zinc-900">{org.name}</h2>
            <p className="text-sm text-zinc-500 mt-1">{org.role_name}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href="/dashboard/organisations/new"
          className="inline-flex items-center gap-2 text-indigo-600 hover:underline"
        >
          + Add organisation
        </Link>
        <Link
          href="/dashboard/maturity-distribution"
          className="inline-flex items-center gap-2 text-indigo-600 hover:underline"
        >
          Maturity distribution →
        </Link>
      </div>
    </div>
  );
}
