import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export default async function OrganisationsListPage() {
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
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Organisations</h1>
      <p className="text-zinc-600 mb-8">Switch or create an organisation.</p>
      <div className="space-y-3">
        {orgs.map((org) => (
          <Link
            key={org.id}
            href={`/dashboard/organisations/${org.id}`}
            className="flex items-center justify-between glass-card p-4 hover:shadow-md transition-shadow"
          >
            <span className="font-medium text-zinc-900">{org.name}</span>
            <span className="text-sm text-zinc-500">{org.role_name}</span>
          </Link>
        ))}
      </div>
      <Link
        href="/dashboard/organisations/new"
        className="mt-6 inline-flex items-center gap-2 text-indigo-600 hover:underline"
      >
        + New organisation
      </Link>
    </div>
  );
}
