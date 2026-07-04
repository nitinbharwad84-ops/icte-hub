'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/utils/formatters';
import { getInternalUsersAction } from '@/lib/actions/owner';
import { Shield, UserCog, Activity, Clock, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface InternalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_activity: string | null;
  created_at: string;
}

export default function AuditLogsListPage() {
  const router = useRouter();
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await getInternalUsersAction(debouncedSearch || undefined, roleFilter);
    if (result.success) {
      setUsers(result.data);
    } else {
      setError(result.error ?? 'An error occurred');
    }
    setLoading(false);
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const roleBadge = (role: string) => {
    if (role === 'owner') return null;
    return (
      <span className={cn(
        'inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full',
        role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
      )}>
        {role === 'admin' ? <Shield className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
        {role === 'admin' ? 'Admin' : 'Telecaller'}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor activity of all internal users</p>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..." aria-label="Search audit logs"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 outline-none transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 transition-all"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="telecaller">Telecaller</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No internal users found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Name</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Email</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Role</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Status</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/owner/audit-logs/${u.id}`)}
                    tabIndex={0} role="button" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/owner/audit-logs/${u.id}`); } }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4">{roleBadge(u.role)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          u.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                        )} />
                        <span className={cn(
                          'text-[10px] font-extrabold uppercase tracking-wider',
                          u.is_active ? 'text-emerald-600' : 'text-slate-400'
                        )}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {u.last_activity ? formatDate(u.last_activity) : 'No activity'}
                      </div>
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
