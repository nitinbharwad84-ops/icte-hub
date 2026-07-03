'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate, formatPhone } from '@/lib/utils/formatters';
import { CALL_OUTCOMES } from '@/lib/utils/constants';
import { ChevronDown, ChevronUp, Phone } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  interested_college_ids: string[];
  status: string;
  created_at: string;
  colleges?: { id: string; name: string }[];
}

interface CallLog {
  id: string;
  lead_id: string;
  outcome: string;
  notes: string | null;
  call_date: string;
}

export default function TelecallerLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<Record<string, CallLog[]>>({});
  const [callLogsLoading, setCallLogsLoading] = useState(false);
  const [submittingCall, setSubmittingCall] = useState<string | null>(null);
  const supabase = createClient();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) { setLoading(false); return; }

    const allCollegeIds = [...new Set(data.flatMap(l => l.interested_college_ids || []))];
    const { data: collegesData } = await supabase.from('colleges').select('id,name').in('id', allCollegeIds);
    const collegeMap = new Map(collegesData?.map(c => [c.id, c.name]) || []);

    const enriched = data.map(lead => ({
      ...lead,
      colleges: (lead.interested_college_ids || []).map((id: string) => ({
        id,
        name: collegeMap.get(id) || 'Unknown College',
      })),
    }));
    setLeads(enriched);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const toggleExpand = async (leadId: string) => {
    if (expandedLead === leadId) { setExpandedLead(null); return; }
    setExpandedLead(leadId);
    if (!callLogs[leadId]) {
      setCallLogsLoading(true);
      const { data } = await supabase
        .from('call_logs')
        .select('*')
        .eq('lead_id', leadId)
        .order('call_date', { ascending: false });
      if (data) setCallLogs(prev => ({ ...prev, [leadId]: data }));
      setCallLogsLoading(false);
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
    if (error) {
      console.error('Status update failed:', error);
      alert('Failed to update status. Please try again.');
    } else {
      fetchLeads();
    }
  };

  const handleLogCall = async (leadId: string, formData: FormData) => {
    setSubmittingCall(leadId);
    const outcome = formData.get('outcome') as string;
    const notes = formData.get('notes') as string;
    await supabase.from('call_logs').insert({ lead_id: leadId, outcome, notes });
    const { data } = await supabase
      .from('call_logs')
      .select('*')
      .eq('lead_id', leadId)
      .order('call_date', { ascending: false });
    if (data) setCallLogs(prev => ({ ...prev, [leadId]: data }));
    setSubmittingCall(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Leads</h1>
          <p className="text-sm text-slate-500 mt-1">{leads.length} assigned leads</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No leads assigned yet</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Name</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Phone</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Colleges</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Status</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Date</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b border-slate-100">
                    <td className="p-4 font-semibold text-slate-800">{lead.name}</td>
                    <td className="p-4 text-slate-600">{formatPhone(lead.phone)}</td>
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
                    <td className="p-4 text-slate-500 text-xs">{formatDate(lead.created_at)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleExpand(lead.id)}
                        className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 hover:text-indigo-600 transition-colors"
                      >
                        {expandedLead === lead.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {expandedLead === lead.id ? 'Collapse' : 'Actions'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expanded lead panel */}
      {expandedLead && (() => {
        const lead = leads.find(l => l.id === expandedLead);
        if (!lead) return null;
        const logs = callLogs[expandedLead] || [];
        return (
          <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h3 className="text-sm font-extrabold text-slate-800 mb-4">{lead.name} — Actions</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status update */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Update Status</label>
                <Select
                  options={[
                    { value: 'new', label: 'Inquiry Received' },
                    { value: 'contacted', label: 'Contacted' },
                    { value: 'interested', label: 'Evaluation' },
                    { value: 'not-interested', label: 'Closed' },
                    { value: 'enrolled-college', label: 'Enrolled' },
                    { value: 'enrolled-institute', label: 'Directly Enrolled' },
                  ]}
                  value={lead.status}
                  onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                />
              </div>

              {/* Call outcome form */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Log Call</label>
                <form action={handleLogCall.bind(null, lead.id)} className="space-y-3">
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <Select
                    name="outcome"
                    options={[
                      { value: '', label: 'Select outcome...' },
                      ...CALL_OUTCOMES.map(o => ({ value: o, label: o.replace(/-/g, ' ') })),
                    ]}
                    required
                  />
                  <textarea
                    name="notes"
                    placeholder="Call notes..."
                    rows={2}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 text-sm px-4 py-3 outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 resize-none transition-all"
                  />
                  <Button type="submit" size="sm" loading={submittingCall === lead.id}>
                    <Phone className="w-3.5 h-3.5" /> Log Call
                  </Button>
                </form>
              </div>
            </div>

            {/* Call history */}
            <div className="mt-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">Call History</h4>
              {callLogsLoading ? (
                <Spinner size={16} />
              ) : logs.length === 0 ? (
                <p className="text-xs text-slate-400">No calls recorded yet</p>
              ) : (
                <div className="space-y-2">
                  {logs.map(call => (
                    <div key={call.id} className="flex items-start gap-3 text-xs bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <span className="font-bold uppercase text-slate-500">{call.outcome.replace(/-/g, ' ')}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-600 flex-1">{call.notes || 'No notes'}</span>
                      <span className="text-slate-400 whitespace-nowrap">{formatDate(call.call_date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
