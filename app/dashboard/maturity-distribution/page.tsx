import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MaturityDistributionChart } from '@/components/maturity-distribution-chart';

export default async function MaturityDistributionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 text-sm">
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Maturity distribution</h1>
      <p className="text-zinc-600 mb-8">
        Distribution of data and AI maturity across your organisations. Filter by industry to see how your portfolio compares.
      </p>
      <MaturityDistributionChart />
    </div>
  );
}
