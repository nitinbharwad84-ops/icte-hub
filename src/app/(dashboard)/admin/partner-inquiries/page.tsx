'use client';
import { useState, useEffect, useCallback, Fragment } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatDate } from '@/lib/utils/formatters';
import { PARTNER_INQUIRY_STATUSES } from '@/lib/utils/constants';
import { downloadCsv } from '@/lib/utils/csv';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';

interface PartnerInquiry {
  id: string;
  college_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export default function PartnerInquiriesPage() {
  const [inquiries, setInquiries] = useState<PartnerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError('');

    let query = supabase
      .from('partner_inquiries')
      .select('id, college_name, contact_person, phone, email, city, message, status, created_at')
      .order('created_at', { ascending: false });

    if (statusFilter) query = query.eq('status', statusFilter);

    const { data, error: fetchError } = await query;
    if (fetchError) { setError(fetchError.message); setLoading(false); return; }

    setInquiries(data || []);
    setLoading(false);
  }, [statusFilter, supabase]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleStatusUpdate = async (inquiryId: string, newStatus: string) => {
    const { error: updateError } = await supabase
      .from('partner_inquiries')
      .update({ status: newStatus })
      .eq('id', inquiryId);
    if (!updateError) fetchInquiries();
  };

  const handleExportCsv = () => {
    const headers = ['Institute Name', 'Contact Person', 'Email', 'Phone', 'City', 'Status', 'Date'];
    const rows = inquiries.map(i => [
      i.college_name, i.contact_person || '', i.email || '', i.phone || '', i.city || '',
      i.status, i.created_at,
    ]);
    downloadCsv(headers, rows, 'partner-inquiries.csv');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Partner Inquiries</h1>
          <p className="text-sm text-slate-500 mt-1">{inquiries.length} total inquiries</p>
        </div>
        <Button variant="dark" onClick={handleExportCsv}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            options={[
              { value: '', label: 'All Statuses' },
              ...PARTNER_INQUIRY_STATUSES.map(s => ({ value: s, label: s.replace('-', ' ') })),
            ]}
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Button variant="secondary" onClick={() => { setStatusFilter(''); }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No partner inquiries found</div>
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
                  <th className="w-10 p-4"></th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <Fragment key={inquiry.id}>
                    <tr
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                      tabIndex={0} role="button" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(expandedId === inquiry.id ? null : inquiry.id); } }}
                    >
                      <td className="p-4 font-semibold text-slate-800">{inquiry.college_name}</td>
                      <td className="p-4 text-slate-600">{inquiry.contact_person || '—'}</td>
                      <td className="p-4 text-slate-600">{inquiry.email || '—'}</td>
                      <td className="p-4 text-slate-600">{inquiry.phone || '—'}</td>
                      <td className="p-4 text-slate-600">{inquiry.city || '—'}</td>
                      <td className="p-4"><StatusBadge status={inquiry.status} /></td>
                      <td className="p-4 text-slate-500 text-xs">{formatDate(inquiry.created_at)}</td>
                      <td className="p-4">
                        <select
                          value={inquiry.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value)}
                          className="text-[10px] bg-transparent border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-brand-blue"
                        >
                          {PARTNER_INQUIRY_STATUSES.map(s => (
                            <option key={s} value={s}>{s.replace('-', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        {expandedId === inquiry.id ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 inline-block" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 inline-block" />
                        )}
                      </td>
                    </tr>
                    {expandedId === inquiry.id && (
                      <tr key={`${inquiry.id}-details`}>
                        <td colSpan={9} className="p-4 bg-slate-50">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Inquiry Details</div>
                          <div className="bg-white rounded-lg p-4 border border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Institute</span>
                                <span className="text-slate-800 font-semibold">{inquiry.college_name}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Contact Person</span>
                                <span className="text-slate-800">{inquiry.contact_person || '—'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Email</span>
                                <span className="text-slate-800">{inquiry.email || '—'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Phone</span>
                                <span className="text-slate-800">{inquiry.phone || '—'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">City</span>
                                <span className="text-slate-800">{inquiry.city || '—'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Submitted</span>
                                <span className="text-slate-800">{formatDate(inquiry.created_at)}</span>
                              </div>
                            </div>
                            {inquiry.message && (
                              <div className="mt-4 pt-4 border-t border-slate-100">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">Message / Proposal</span>
                                <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{inquiry.message}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
