'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';
const GREEN = '#16A34A';

type TeamMember = {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
};

const roleLabels: Record<string, string> = {
  lead: 'Lead',
  manager: 'Manager',
  operator: 'Operator',
};

const roleDescriptions: Record<string, string> = {
  lead: 'Full authority. Only a Lead can file ODPC reports, DSAR responses, and renewals.',
  manager: 'Day to day operations. Can log and manage clients but cannot file legal responses.',
  operator: 'Works on intake and security measures. Cannot file legal responses or manage the team.',
};

export default function TeamPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [myFirmName, setMyFirmName] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addRole, setAddRole] = useState<'manager' | 'operator'>('manager');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [createdInvite, setCreatedInvite] = useState<{
    email: string;
    password: string;
    role: string;
  } | null>(null);

  async function load() {
    setLoading(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/firm/login');
      return;
    }

    const { data: myRow } = await supabase
      .from('firm_users')
      .select('firm_id, role, firms(name)')
      .eq('user_id', user.id)
      .order('is_active', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!myRow) {
      setLoading(false);
      return;
    }

    setMyRole(myRow.role);
    setMyFirmName((myRow as any).firms?.name ?? '');

    const { data: team, error: teamErr } = await supabase
      .from('firm_users')
      .select('id, user_id, full_name, role, is_active, must_change_password, created_at')
      .eq('firm_id', myRow.firm_id)
      .order('created_at', { ascending: true });

    if (teamErr) {
      setError(teamErr.message);
      setLoading(false);
      return;
    }

    setMembers((team ?? []) as TeamMember[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/firm/team/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          role: addRole,
          password: password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Could not add team member.');
        setSaving(false);
        return;
      }

      setCreatedInvite({
        email: email.trim().toLowerCase(),
        password: password,
        role: addRole,
      });

      setFullName('');
      setEmail('');
      setPassword('');
      setAddRole('manager');
      setShowAddForm(false);

      await load();
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-sm text-zinc-500">Loading...</p>
        </main>
      </div>
    );
  }

  const isLead = myRole === 'lead';

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/firm/dashboard" className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className="text-base font-semibold text-zinc-900">
              {myFirmName || 'Praxis'}
            </span>
          </Link>
          <Link
            href="/firm/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Back to dashboard
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: ODPC_BLUE }}
          >
            Team
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Manage your team
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isLead
              ? 'Add managers and operators, and see who has access to your firm.'
              : 'See who has access to your firm.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {createdInvite && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-6">
            <h2 className="text-sm font-semibold text-green-900">
              Team member added
            </h2>
            <p className="mt-2 text-sm text-green-800">
              Share these credentials with {createdInvite.email}. They will be
              asked to change the password on first login.
            </p>
            <div className="mt-4 space-y-2 rounded-lg border border-green-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email
              </p>
              <p className="font-mono text-sm text-zinc-900">
                {createdInvite.email}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Temporary password
              </p>
              <p className="font-mono text-sm text-zinc-900">
                {createdInvite.password}
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Role
              </p>
              <p className="text-sm text-zinc-900">
                {roleLabels[createdInvite.role]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreatedInvite(null)}
              className="mt-4 text-xs font-medium text-green-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLead && !showAddForm && (
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setAddRole('manager');
                setShowAddForm(true);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              + Add a manager
            </button>
            <button
              type="button"
              onClick={() => {
                setAddRole('operator');
                setShowAddForm(true);
              }}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium"
              style={{ borderColor: ODPC_BLUE, color: ODPC_BLUE }}
            >
              + Add an operator
            </button>
          </div>
        )}

        {isLead && showAddForm && (
          <form
            onSubmit={handleAdd}
            className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Add a {roleLabels[addRole]}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {roleDescriptions[addRole]}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Wanjiku"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@firm.co.ke"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Temporary password
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  You will see this password after saving. Share it with the
                  team member. They will be forced to change it on first login.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFullName('');
                  setEmail('');
                  setPassword('');
                  setError('');
                }}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: ODPC_BLUE }}
              >
                {saving ? 'Creating...' : 'Create team member'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-6 py-4">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Team members ({members.length})
            </h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-start justify-between gap-4 px-6 py-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-zinc-900">
                      {m.full_name || 'Unnamed'}
                    </p>
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: '#EBF2F9', color: ODPC_BLUE }}
                    >
                      {roleLabels[m.role] ?? m.role}
                    </span>
                    {m.must_change_password && (
                      <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Awaiting first login
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Joined {new Date(m.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {m.user_id === (members.find((x) => x.role === 'lead')?.user_id) && (
                  <span className="text-xs text-zinc-400">Lead</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          Every action in Praxis is logged with the team member who took it.
        </p>
      </main>
    </div>
  );
}