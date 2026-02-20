import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AcquisitionTargetDisplay } from '@/components/acquisition-target-display';

export default async function AcquisitionScannerPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 text-sm">
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Acquisition Opportunity Scanner</h1>
      <p className="text-zinc-600 mb-8">
        Identify undervalued companies in your portfolio by data/AI maturity and potential. Filter by industry and valuation, then run a scan to see ranked acquisition targets.
      </p>
      <AcquisitionTargetDisplay />
    </div>
  );
}
