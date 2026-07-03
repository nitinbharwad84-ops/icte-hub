'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/utils/formatters';
import { getUserProfileAction, getUserAuditLogsAction } from '@/lib/actions/owner';
import { Shield, UserCog, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, Activity, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface AuditLog {
  id: string;
  user_id: string;
  user_role: string;
  action: string;
  target_entity: string;
  target_id: string | null;
  description: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

const actionColors: Record<string, string> = {
  create: 'bg-emerald-50 text-emerald-600',
  update: 'bg-blue-50 text-blue-600',
  delete: 'bg-red-50 text-red-600',
  status_change: 'bg-amber-50 text-amber-600',
  login: 'bg-indigo-50 text-indigo-600',
  password_change: 'bg-purple-50 text-purple-600',
  assign: 'bg-cyan-50 text-cyan-600',
  export: 'bg-slate-50 text-slate-600',
  upload: 'bg-teal-50 text-teal-600',
};

export default function UserAuditLogsPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    const [profileResult, logsResult] = await Promise.all([
      getUserProfileAction(userId),
      getUserAuditLogsAction(userId, page, pageSize, actionFilter || undefined, entityFilter || undefined),
    ]);

    if (profileResult.success) {
      setProfile(profileResult.data);
    } else {
      setError(profileResult.error ?? 'Failed to load user profile');
    }

    if (logsResult.success) {
      setLogs(logsResult.data);
      setTotalCount(logsResult.count);
    } else {
      setError(logsResult.error ?? 'Failed to load audit logs');
    }

    setLoading(false);
  }, [userId, page, pageSize, actionFilter, entityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatJson = (val: Record<string, unknown> | null) => {
    if (!val) return null;
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center py-16"><Spinner size={32} /></div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {profile?.name || 'User'} — Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {profile?.email} &middot; {totalCount} total entries
          </p>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 transition-all"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="status_change">Status Change</option>
          <option value="login">Login</option>
          <option value="password_change">Password Change</option>
          <option value="assign">Assign</option>
          <option value="export">Export</option>
          <option value="upload">Upload</option>
        </select>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 transition-all"
        >
          <option value="">All Entities</option>
          <option value="leads">Leads</option>
          <option value="institute_leads">Institute Leads</option>
          <option value="colleges">Colleges</option>
          <option value="institute_courses">Institute Courses</option>
          <option value="users">Users</option>
          <option value="commissions">Commissions</option>
          <option value="call_logs">Call Logs</option>
          <option value="partner_inquiries">Partner Inquiries</option>
          <option value="visitors">Visitors</option>
          <option value="auth">Auth</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          Page {page} of {totalPages || 1}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No audit logs found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Action</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Entity</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Target ID</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Description</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Changes</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">IP</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider',
                        actionColors[log.action] || 'bg-slate-100 text-slate-600'
                      )}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-xs font-semibold">{log.target_entity.replace('_', ' ')}</td>
                    <td className="p-4">
                      {log.target_id ? (
                        <span className="text-[10px] font-mono text-slate-400">{log.target_id.slice(0, 8)}...</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{log.description}</td>
                    <td className="p-4">
                      {(log.old_value || log.new_value) ? (
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue hover:text-indigo-700 transition-colors"
                        >
                          {expandedRows.has(log.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {expandedRows.has(log.id) ? 'Hide' : 'View'}
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-4 text-[10px] font-mono text-slate-400">{log.ip_address || '—'}</td>
                    <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDate(log.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
                {expandedRows.size > 0 && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      {logs.filter(l => expandedRows.has(l.id)).map(log => (
                        <div key={`expand-${log.id}`} className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                          <div className="grid grid-cols-2 gap-4">
                            {log.old_value && (
                              <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 mb-1">Old Value</p>
                                <pre className="text-xs font-mono bg-white rounded-lg border border-slate-200 p-3 overflow-x-auto max-h-40">
                                  {formatJson(log.old_value)}
                                </pre>
                              </div>
                            )}
                            {log.new_value && (
                              <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 mb-1">New Value</p>
                                <pre className="text-xs font-mono bg-white rounded-lg border border-slate-200 p-3 overflow-x-auto max-h-40">
                                  {formatJson(log.new_value)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <span className="text-xs font-bold text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
