import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { notFound } from 'next/navigation';
import { OrganisationProfile } from '@/components/organisation-profile';

export default async function OrganisationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const { id } = await params;
  const canAccess = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, id]
  );
  if (!canAccess) notFound();
  type OrgRow = { id: string; name: string; slug: string | null; company_size: string | null; industry: string | null; revenue: string | null; geography: string | null; employee_count: number | null; metadata: Record<string, unknown> };
  const org = await queryOne<OrgRow>(
    'SELECT id, name, slug, company_size, industry, revenue, geography, employee_count, metadata FROM organisations WHERE id = $1',
    [id]
  );
  if (!org) notFound();
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/organisations" className="text-zinc-500 hover:text-zinc-900 text-sm">
          ← Organisations
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">{org.name}</h1>
      <p className="text-zinc-600 mb-8">Organisation profile</p>
      <OrganisationProfile org={org} />
      <div className="mt-8 flex gap-4">
        <Link
          href={`/dashboard/organisations/${id}/data-audit`}
          className="text-indigo-600 hover:underline"
        >
          Data Maturity Audit →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/ai-audit`}
          className="text-indigo-600 hover:underline"
        >
          AI Maturity Audit →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/classify`}
          className="text-indigo-600 hover:underline"
        >
          Maturity Classification →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/financial-impact`}
          className="text-indigo-600 hover:underline"
        >
          Financial Impact →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/roi-investment`}
          className="text-indigo-600 hover:underline"
        >
          ROI & Investment →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/risk-assessment`}
          className="text-indigo-600 hover:underline"
        >
          Risk Assessment →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/roadmap`}
          className="text-indigo-600 hover:underline"
        >
          Transformation Roadmap →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/capability-gaps`}
          className="text-indigo-600 hover:underline"
        >
          Capability Gap Analysis →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/executive-dashboard`}
          className="text-indigo-600 hover:underline"
        >
          Executive Dashboard →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/industry-benchmarks`}
          className="text-indigo-600 hover:underline"
        >
          Industry Benchmarks →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/competitive-position`}
          className="text-indigo-600 hover:underline"
        >
          Competitive Position →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/valuation-adjustment`}
          className="text-indigo-600 hover:underline"
        >
          Valuation adjustment →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/live-maturity`}
          className="text-indigo-600 hover:underline"
        >
          Live maturity →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/data-connectors`}
          className="text-indigo-600 hover:underline"
        >
          Data connectors →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/maturity-progress`}
          className="text-indigo-600 hover:underline"
        >
          Maturity progress →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/investment-simulation`}
          className="text-indigo-600 hover:underline"
        >
          Investment simulation →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/strategic-simulation`}
          className="text-indigo-600 hover:underline"
        >
          Strategic simulator →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/digital-twin`}
          className="text-indigo-600 hover:underline"
        >
          Digital twin →
        </Link>
        <Link
          href={`/dashboard/organisations/${id}/team`}
          className="text-indigo-600 hover:underline"
        >
          Team & invitations →
        </Link>
      </div>
    </div>
  );
}
