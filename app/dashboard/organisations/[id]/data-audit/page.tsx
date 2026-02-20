import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { notFound } from 'next/navigation';
import { DataAuditPageClient } from '@/components/data-audit-page-client';

export default async function DataAuditPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/organisations/${id}`} className="text-zinc-500 hover:text-zinc-900 text-sm">
          ← {org.name}
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Data Maturity Audit</h1>
      <p className="text-zinc-600 mb-8">
        Assess data collection, storage, integration, governance, and accessibility. Run the audit to get your
        maturity stage (1–6), confidence score, and maturity index (0–100).
      </p>
      <DataAuditPageClient organisationId={id} />
    </div>
  );
}
