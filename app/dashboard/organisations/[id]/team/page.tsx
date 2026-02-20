import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { notFound } from 'next/navigation';
import { TeamTable } from '@/components/team-table';
import { InviteForm } from '@/components/invite-form';

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const { id } = await params;
  const canAccess = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, id]
  );
  if (!canAccess) notFound();
  const org = await queryOne<{ name: string }>('SELECT name FROM organisations WHERE id = $1', [id]);
  if (!org) notFound();
  type MemberRow = { id: string; email: string | null; name: string | null; image: string | null; role_name: string; is_default: boolean; created_at: string };
  type InvitationRow = { id: string; email: string; role_name: string; expires_at: string; created_at: string };
  const members = await query<MemberRow>(
    `SELECT u.id, u.email, u.name, u.image, r.name AS role_name, uo.is_default, uo.created_at
     FROM user_organisations uo
     JOIN users u ON u.id = uo.user_id
     JOIN roles r ON r.id = uo.role_id
     WHERE uo.organisation_id = $1 ORDER BY uo.created_at`,
    [id]
  );
  const invitations = await query<InvitationRow>(
    `SELECT i.id, i.email, i.role_id, i.token, i.expires_at, i.created_at, r.name AS role_name
     FROM invitations i JOIN roles r ON r.id = i.role_id
     WHERE i.organisation_id = $1 AND i.accepted_at IS NULL AND i.expires_at > NOW()`,
    [id]
  );
  const myRole = await queryOne<{ role_name: string }>(
    `SELECT r.name AS role_name FROM user_organisations uo JOIN roles r ON r.id = uo.role_id WHERE uo.user_id = $1 AND uo.organisation_id = $2`,
    [session.user.id, id]
  );
  const canInvite = myRole?.role_name === 'Executive' || myRole?.role_name === 'Analyst';

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/organisations/${id}`} className="text-zinc-500 hover:text-zinc-900 text-sm">
          ← {org.name}
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Team</h1>
      <p className="text-zinc-600 mb-8">Members and pending invitations.</p>
      {canInvite && <InviteForm organisationId={id} />}
      <TeamTable members={members} invitations={invitations} organisationId={id} canManage={canInvite} />
    </div>
  );
}
