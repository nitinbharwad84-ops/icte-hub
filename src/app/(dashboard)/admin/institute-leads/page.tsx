'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/utils/formatters';
import { INSTITUTE_LEAD_STATUSES } from '@/lib/utils/constants';
import { Download, Search } from 'lucide-react';

interface InstituteLead {
  id: string;
  college_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  status: string;
  created_at: string;
}

export default function InstituteLeadsPage() {
  const [leads, setLeads] = useState<InstituteLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');

    let query = supabase
      .from('partner_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter) query = query.eq('status', statusFilter);

    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setLoading(false); return; }

    setLeads(data || []);
    setLoading(false);
  }, [statusFilter, supabase]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    const { error: updateError } = await supabase
      .from('partner_inquiries')
      .update({ status: newStatus })
      .eq('id', leadId);
    if (!updateError) fetchLeads();
  };

  const handleExportCsv = () => {
    const headers = ['Institute Name', 'Contact Person', 'Email', 'Phone', 'City', 'Status', 'Date'];
    const rows = leads.map(l => [
      l.college_name, l.contact_person || '', l.email || '', l.phone || '', l.city || '',
      l.status, l.created_at,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'institute-leads.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLeads = leads.filter(l =>
    l.college_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.contact_person || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Institute Leads</h1>
          <p className="text-sm text-slate-500 mt-1">{leads.length} total inquiries</p>
        </div>
        <Button variant="dark" onClick={handleExportCsv}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text" placeholder="Search institute, person, or email..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:border-brand-blue/50"
            />
          </div>
          <Select
            options={[
              { value: '', label: 'All Statuses' },
              ...INSTITUTE_LEAD_STATUSES.map(s => ({ value: s, label: s.replace('-', ' ') })),
            ]}
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Button variant="secondary" onClick={() => { setStatusFilter(''); setSearchQuery(''); }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No institute leads found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Institute</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Contact Person</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Email</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Phone</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">City</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Status</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Date</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{lead.college_name}</td>
                    <td className="p-4 text-slate-600">{lead.contact_person || '—'}</td>
                    <td className="p-4 text-slate-600">{lead.email || '—'}</td>
                    <td className="p-4 text-slate-600">{lead.phone || '—'}</td>
                    <td className="p-4 text-slate-600">{lead.city || '—'}</td>
                    <td className="p-4"><StatusBadge status={lead.status} /></td>
                    <td className="p-4 text-slate-500 text-xs">{formatDate(lead.created_at)}</td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                        className="text-[10px] bg-transparent border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-brand-blue"
                      >
                        {INSTITUTE_LEAD_STATUSES.map(s => (
                          <option key={s} value={s}>{s.replace('-', ' ')}</option>
                        ))}
                      </select>
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
