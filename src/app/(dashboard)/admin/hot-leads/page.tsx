'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatPhone } from '@/lib/utils/formatters';
import { Flame, ChevronDown, ChevronUp, Clock, Eye } from 'lucide-react';

interface PageVisit {
  id: string;
  page_url: string;
  page_title: string | null;
  created_at: string;
}

interface HotLead {
  id: string;
  name: string;
  phone: string;
  status: string;
  session_id: string | null;
  created_at: string;
  total_visits: number;
  unique_pages: number;
  used_smart_search: boolean;
  last_activity: string | null;
  score: number;
  visits: PageVisit[];
}

const scoreColor = (score: number): 'slate' | 'blue' | 'indigo' | 'purple' | 'emerald' | 'teal' | 'amber' | 'red' => {
  if (score >= 80) return 'emerald';
  if (score >= 60) return 'teal';
  if (score >= 40) return 'indigo';
  if (score >= 20) return 'blue';
  return 'slate';
};

export default function HotLeadsPage() {
  const [leads, setLeads] = useState<HotLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [visitHistory, setVisitHistory] = useState<Record<string, PageVisit[]>>({});
  const [visitLoading, setVisitLoading] = useState(false);
  const supabase = createClient();

  const fetchHotLeads = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data: visitorsData, error: visitorsError } = await supabase
      .from('visitors')
      .select('session_id, converted_to_lead_id, mode_filters_used, last_seen_at')
      .not('converted_to_lead_id', 'is', null);

    if (visitorsError) { setError(visitorsError.message); setLoading(false); return; }
    if (!visitorsData?.length) { setLeads([]); setLoading(false); return; }

    const leadIds = visitorsData.map(v => v.converted_to_lead_id).filter(Boolean) as string[];
    const sessionIds = visitorsData.map(v => v.session_id);
    const visitorMap = new Map(visitorsData.map(v => [v.converted_to_lead_id, v]));

    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('id, name, phone, status, created_at, session_id')
      .in('id', leadIds);

    if (leadsError) { setError(leadsError.message); setLoading(false); return; }

    const { data: visitsData, error: visitsError } = await supabase
      .from('page_visits')
      .select('id, session_id, page_url, page_title, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false });

    if (visitsError) { setError(visitsError.message); setLoading(false); return; }

    const visitsBySession = new Map<string, PageVisit[]>();
    if (visitsData) {
      for (const v of visitsData) {
        if (!visitsBySession.has(v.session_id)) visitsBySession.set(v.session_id, []);
        visitsBySession.get(v.session_id)!.push(v);
      }
    }

    const hotLeads: HotLead[] = (leadsData || []).map(lead => {
      const visitor = visitorMap.get(lead.id);
      const sessionVisits = visitor ? visitsBySession.get(visitor.session_id) || [] : [];
      const totalVisits = sessionVisits.length;
      const uniquePages = new Set(sessionVisits.map(v => v.page_url)).size;
      const usedSmartSearch = visitor ? (visitor.mode_filters_used?.length || 0) > 0 : false;

      const score = Math.min(
        totalVisits * 20 + uniquePages * 10 + (usedSmartSearch ? 30 : 0) + 40,
        100
      );

      return {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        status: lead.status,
        session_id: lead.session_id,
        created_at: lead.created_at,
        total_visits: totalVisits,
        unique_pages: uniquePages,
        used_smart_search: usedSmartSearch,
        last_activity: visitor?.last_seen_at || lead.created_at,
        score,
        visits: sessionVisits,
      };
    });

    hotLeads.sort((a, b) => b.score - a.score);
    setLeads(hotLeads);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchHotLeads();
  }, [fetchHotLeads]);

  const handleExpand = async (leadId: string) => {
    if (expandedLead === leadId) {
      setExpandedLead(null);
      return;
    }

    if (!visitHistory[leadId]) {
      setVisitLoading(true);
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setVisitHistory(prev => ({ ...prev, [leadId]: lead.visits }));
      }
      setVisitLoading(false);
    }
    setExpandedLead(leadId);
  };

  const filteredLeads = leads.filter(l => l.score >= minScore);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">Hot Leads</h1>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {leads.length} leads with behavioral engagement data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="min-score" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Min Score
          </label>
          <input
            id="min-score"
            type="number"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-24 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:border-brand-blue/50 text-center"
          />
        </div>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No hot leads found{minScore > 0 ? ' matching the minimum score' : ''}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Name</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Phone</th>
                  <th className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Visits</th>
                  <th className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Unique Pages</th>
                  <th className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Score</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Status</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Last Activity</th>
                  <th className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <React.Fragment key={lead.id}>
                    <tr
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleExpand(lead.id)}
                      tabIndex={0} role="button" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleExpand(lead.id); } }}
                    >
                      <td className="p-4 font-semibold text-slate-800">{lead.name}</td>
                      <td className="p-4 text-slate-600">{formatPhone(lead.phone)}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {lead.total_visits}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-600">{lead.unique_pages}</td>
                      <td className="p-4 text-center">
                        <Badge color={scoreColor(lead.score)}>
                          {lead.score}/100
                        </Badge>
                      </td>
                      <td className="p-4"><StatusBadge status={lead.status} /></td>
                      <td className="p-4 text-slate-500 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lead.last_activity ? formatDate(lead.last_activity) : '-'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {expandedLead === lead.id ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 inline-block" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 inline-block" />
                        )}
                      </td>
                    </tr>
                    {expandedLead === lead.id && (
                      <tr key={`${lead.id}-visits`}>
                        <td colSpan={8} className="p-4 bg-slate-50">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Visit History</div>
                          {visitLoading && !visitHistory[lead.id] ? (
                            <Spinner size={16} />
                          ) : (visitHistory[lead.id] || []).length === 0 ? (
                            <p className="text-xs text-slate-400">No visit data recorded</p>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {(visitHistory[lead.id] || []).map((visit) => (
                                <div key={visit.id} className="flex items-start gap-3 text-xs bg-white rounded-lg p-3 border border-slate-100">
                                  <span className="font-medium text-slate-700 flex-1 truncate">{visit.page_title || visit.page_url}</span>
                                  <span className="text-slate-400 text-[10px] truncate max-w-[200px] hidden sm:block">{visit.page_url}</span>
                                  <span className="text-slate-400 whitespace-nowrap">{formatDate(visit.created_at)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
