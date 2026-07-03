'use client';

import { useActionState } from 'react';

export const dynamic = 'force-dynamic';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createPartnerInquiry } from '@/lib/actions/colleges';
import { CheckCircle } from 'lucide-react';

const initialState: { success: boolean; error?: string } = { success: false };

export default function PartnerWithUsPage() {
  const [state, formAction, pending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      return createPartnerInquiry(_prevState, formData);
    },
    initialState
  );

  if (state.success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-card p-8 md:p-12">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Thank you! We&apos;ll review your request.</h2>
            <Button
              variant="secondary"
              className="mt-6"
              onClick={() => window.location.reload()}
            >
              Submit Another Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-24">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-card p-8 md:p-12">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Partner With Us</h1>
          <p className="text-sm text-slate-500 mb-8">
            Submit a partnership request for your college or university
          </p>

          <form action={formAction} className="space-y-5">
            <Input
              name="college_name"
              label="College / Institution Name *"
              placeholder="e.g. University of Technology"
              required
            />
            <Input
              name="contact_person"
              label="Contact Person Name *"
              placeholder="Dr. Jane Smith"
              required
            />
            <Input
              name="phone"
              label="Phone Number *"
              placeholder="+1 234 567 8900"
              required
            />
            <Input
              name="email"
              label="Email Address *"
              type="email"
              placeholder="jane@university.edu"
              required
            />
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
                Proposal / Message (optional)
              </label>
              <textarea
                name="message"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-semibold px-4 py-3 outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 transition-all resize-none"
                rows={4}
                placeholder="Tell us about your institution and partnership goals..."
              />
            </div>

            {state.error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
            )}

            <Button type="submit" loading={pending} className="w-full">
              Submit Request
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
