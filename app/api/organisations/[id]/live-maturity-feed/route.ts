import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { getLiveMaturityState } from '@/lib/live-maturity-service';

async function canAccess(session: { user: { id: string } }, organisationId: string): Promise<boolean> {
  const row = await queryOne(
    'SELECT id FROM user_organisations WHERE user_id = $1 AND organisation_id = $2',
    [session.user.id, organisationId]
  );
  return !!row;
}

/** GET: Server-Sent Events stream for live maturity updates */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { id: organisationId } = await params;
  if (!(await canAccess(session, organisationId))) {
    return new Response('Forbidden', { status: 403 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: object) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const state = await getLiveMaturityState(organisationId, { historyLimit: 100 });
        send('state', state);

        for (let i = 0; i < 3; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          const next = await getLiveMaturityState(organisationId, { historyLimit: 100 });
          if (
            next.history.length !== state.history.length ||
            (next.latest?.snapshot_at !== state.latest?.snapshot_at)
          ) {
            send('update', next);
          }
        }
      } catch (e) {
        console.error('Live maturity feed error:', e);
        send('error', { message: 'Feed error' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-cache',
      Connection: 'keep-alive',
    },
  });
}
