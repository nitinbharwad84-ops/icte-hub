'use client';

import { useActionState } from 'react';
import { Search, User, Phone, Calendar, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { checkLeadStatus } from '@/lib/actions/leads';
import { STATUS_DESCRIPTIONS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/formatters';

type CheckStatusState = {
  found: boolean;
  submitted: boolean;
  error?: string;
  leads?: Array<{
    name: string;
    status: string;
    interested_college_ids: string[];
    created_at: string;
  }>;
};

export default function CheckStatusPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, pending] = useActionState(checkLeadStatus as any, {
    found: false,
    submitted: false,
  } as CheckStatusState);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <Card glass hover={false} className="max-w-lg w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-2">
            <Search className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Check Your Inquiry Status</h1>
          <p className="text-sm text-slate-500">Enter your details to check the status of your inquiry.</p>
        </div>

        <form action={formAction} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            icon={<User className="w-4 h-4" />}
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="1234567890"
            icon={<Phone className="w-4 h-4" />}
            pattern="[0-9]{10}"
            maxLength={10}
            required
          />
          <Button type="submit" loading={pending} className="w-full">
            Check Status
          </Button>
        </form>

        {state.error && (
          <p className="text-center text-sm text-red-500 py-2">{state.error}</p>
        )}
        {state.found && state.leads && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
              {state.leads.length === 1 ? '1 Result Found' : `${state.leads.length} Results Found`}
            </p>
            {state.leads.map((lead, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-800">{lead.name}</h3>
                  <StatusBadge status={lead.status} />
                </div>
                <p className="text-xs text-slate-500">{STATUS_DESCRIPTIONS[lead.status] || ''}</p>
                {lead.interested_college_ids && lead.interested_college_ids.length > 0 && (
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{lead.interested_college_ids.length} college(s) selected</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Submitted {formatDate(lead.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {state.submitted && !state.found && (
          <p className="text-center text-sm text-slate-400 py-4">
            No inquiry found with those details. Please check your information and try again.
          </p>
        )}
      </Card>
    </div>
  );
}
