'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatDate, formatPhone } from '@/lib/utils/formatters';
import { LEAD_STATUSES } from '@/lib/utils/constants';
import { Search, Download, Phone, ChevronDown, ChevronUp } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  interested_college_ids: string[];
  status: string;
  assigned_telecaller_id: string | null;
  created_at: string;
  colleges?: { id: string; name: string }[];
  assigned_telecaller?: { id: string; name: string } | null;
}

interface Telecaller {
  id: string;
  name: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [telecallers, setTelecallers] = useState<Telecaller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [telecallerFilter, setTelecallerFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [callHistory, setCallHistory] = useState<Record<string, unknown>[]>([]);
  const [callHistoryLoading, setCallHistoryLoading] = useState(false);
  const supabase = createClient();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');

    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter) query = query.eq('status', statusFilter);
    if (telecallerFilter) query = query.eq('assigned_telecaller_id', telecallerFilter);

    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setLoading(false); return; }

    // Fetch related data
    const leadIds = data?.map(l => l.id) || [];
    const telecallerIds = [...new Set(data?.map(l => l.assigned_telecaller_id).filter(Boolean))] as string[];

    // Get college names
    const allCollegeIds = [...new Set(data?.flatMap(l => l.interested_college_ids || []) || [])];
    const { data: collegesData } = await supabase.from('colleges').select('id,name').in('id', allCollegeIds);
    const collegeMap = new Map(collegesData?.map(c => [c.id, c.name]) || []);

    // Get telecaller names
    const { data: telecallersData } = await supabase
      .from('users')
      .select('id,name')
      .in('id', telecallerIds.length > 0 ? telecallerIds : ['no-op']);
    const telecallerMap = new Map(telecallersData?.map(t => [t.id, t.name]) || []);

    const enrichedLeads = data?.map(lead => ({
      ...lead,
      colleges: (lead.interested_college_ids || []).map((id: string) => ({
        id,
        name: collegeMap.get(id) || 'Unknown College',
      })),
      assigned_telecaller: lead.assigned_telecaller_id
        ? { id: lead.assigned_telecaller_id, name: telecallerMap.get(lead.assigned_telecaller_id) || 'Unknown' }
        : null,
    })) || [];

    setLeads(enrichedLeads);
    setLoading(false);
  }, [statusFilter, telecallerFilter, supabase]);

  useEffect(() => {
    // Fetch telecallers for filter/assign dropdown
    supabase.from('users').select('id,name').eq('role', 'telecaller').eq('is_active', true)
      .then(({ data }) => setTelecallers(data || []));
    fetchLeads();
  }, [fetchLeads, supabase]);

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);
    if (!updateError) fetchLeads();
  };

  const handleAssign = async (leadId: string, telecallerId: string) => {
    const { error: assignError } = await supabase
      .from('leads')
      .update({ assigned_telecaller_id: telecallerId || null })
      .eq('id', leadId);
    if (!assignError) fetchLeads();
  };

  const handleViewCallHistory = async (leadId: string) => {
    setCallHistoryLoading(true);
    setExpandedLead(expandedLead === leadId ? null : leadId);
    if (expandedLead !== leadId) {
      const { data } = await supabase
        .from('call_logs')
        .select('*')
        .eq('lead_id', leadId)
        .order('call_date', { ascending: false });
      setCallHistory(data || []);
    }
    setCallHistoryLoading(false);
  };

  const handleExportCsv = () => {
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Assigned Telecaller', 'Created'];
    const rows = leads.map(l => [
      l.name, l.phone, l.email || '', l.status,
      l.assigned_telecaller?.name || 'Unassigned', l.created_at
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Filter by search query
  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Lead Management</h1>
          <p className="text-sm text-slate-500 mt-1">{leads.length} total leads</p>
        </div>
        <Button variant="dark" onClick={handleExportCsv}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text" placeholder="Search name or phone..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:border-brand-blue/50"
            />
          </div>
          <Select
            options={[{ value: '', label: 'All Statuses' }, ...LEAD_STATUSES.map(s => ({ value: s, label: s.replace('-', ' ') }))]}
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Select
            options={[{ value: '', label: 'All Telecallers' }, ...telecallers.map(t => ({ value: t.id, label: t.name }))]}
            value={telecallerFilter} onChange={(e) => setTelecallerFilter(e.target.value)}
          />
          <Button variant="secondary" onClick={() => { setStatusFilter(''); setTelecallerFilter(''); setSearchQuery(''); }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No leads found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Name</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Contact</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Colleges</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Status</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Telecaller</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Date</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <>
                    <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">{lead.name}</td>
                      <td className="p-4">
                        <p className="text-slate-600">{lead.phone}</p>
                        {lead.email && <p className="text-xs text-slate-400">{lead.email}</p>}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.colleges?.slice(0, 2).map(c => (
                            <span key={c.id} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{c.name}</span>
                          ))}
                          {(lead.colleges?.length || 0) > 2 && (
                            <span className="text-[10px] text-slate-400">+{lead.colleges!.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4"><StatusBadge status={lead.status} /></td>
                      <td className="p-4">
                        <select
                          value={lead.assigned_telecaller_id || ''}
                          onChange={(e) => handleAssign(lead.id, e.target.value)}
                          className="text-xs bg-transparent border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-brand-blue"
                        >
                          <option value="">Unassigned</option>
                          {telecallers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-slate-500 text-xs">{formatDate(lead.created_at)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                            className="text-[10px] bg-transparent border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-brand-blue"
                          >
                            {LEAD_STATUSES.map(s => (
                              <option key={s} value={s}>{s.replace('-', ' ')}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleViewCallHistory(lead.id)}
                            className="text-slate-400 hover:text-indigo-500 transition-colors"
                            title="Call History"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedLead === lead.id && (
                      <tr key={`${lead.id}-calls`}>
                        <td colSpan={7} className="p-4 bg-slate-50">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Call History</div>
                          {callHistoryLoading ? (
                            <Spinner size={16} />
                          ) : callHistory.length === 0 ? (
                            <p className="text-xs text-slate-400">No calls recorded</p>
                          ) : (
                            <div className="space-y-2">
                              {callHistory.map((call: any) => (
                                <div key={call.id} className="flex items-start gap-3 text-xs bg-white rounded-lg p-3 border border-slate-100">
                                  <span className="font-bold uppercase text-slate-500">{call.outcome.replace(/-/g, ' ')}</span>
                                  <span className="text-slate-400">-</span>
                                  <span className="text-slate-600">{call.notes || 'No notes'}</span>
                                  <span className="text-slate-400 ml-auto">{formatDate(call.call_date)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
