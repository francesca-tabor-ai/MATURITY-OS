'use client';

type Member = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role_name: string;
  is_default: boolean;
  created_at: string;
};

type Invitation = {
  id: string;
  email: string;
  role_name: string;
  expires_at: string;
  created_at: string;
};

export function TeamTable({
  members,
  invitations,
  organisationId,
  canManage,
}: {
  members: Member[];
  invitations: Invitation[];
  organisationId: string;
  canManage: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-zinc-700">Member</th>
              <th className="px-4 py-3 text-sm font-medium text-zinc-700">Role</th>
              <th className="px-4 py-3 text-sm font-medium text-zinc-700">Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium text-zinc-900">{m.name || m.email || m.id}</span>
                  {m.email && <span className="block text-sm text-zinc-500">{m.email}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-zinc-200 px-2 py-0.5 text-sm">{m.role_name}</span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-500">
                  {new Date(m.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {invitations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Pending invitations</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-zinc-700">Email</th>
                  <th className="px-4 py-3 text-sm font-medium text-zinc-700">Role</th>
                  <th className="px-4 py-3 text-sm font-medium text-zinc-700">Expires</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((i) => (
                  <tr key={i.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-4 py-3 text-zinc-900">{i.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-sm">{i.role_name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {new Date(i.expires_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
