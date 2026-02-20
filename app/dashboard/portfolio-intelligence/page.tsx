import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PortfolioIntelligenceDashboard } from '@/components/portfolio-intelligence-dashboard';

export default async function PortfolioIntelligencePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 text-sm">
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">Portfolio Intelligence</h1>
      <p className="text-zinc-600 mb-8">
        Maturity distribution, value creation opportunities, and risk exposure across your portfolio. Filter by industry to focus on a segment.
      </p>
      <PortfolioIntelligenceDashboard />
    </div>
  );
}
