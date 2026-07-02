'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createLeadAction } from '@/lib/actions/leads';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  course_id: z.string().min(1, 'Please select a course'),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CourseOption {
  id: string;
  name: string;
}

interface InstituteInquiryModalProps {
  open: boolean;
  onClose: () => void;
  courses: CourseOption[];
}

export function InstituteInquiryModal({ open, onClose, courses }: InstituteInquiryModalProps) {
  const [form, setForm] = useState<FormData>({ name: '', phone: '', email: '', course_id: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setServerError('');

    const result = formSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      for (const [key, errs] of Object.entries(result.error.flatten().fieldErrors)) {
        fieldErrors[key as keyof FormData] = errs?.[0];
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await createLeadAction(result.data);
    setLoading(false);

    if (res.success) {
      setSuccess(res.message || 'Inquiry submitted successfully!');
      setForm({ name: '', phone: '', email: '', course_id: '', message: '' });
    } else {
      setServerError(typeof res.error === 'string' ? res.error : 'Submission failed. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-slate-900">Institute Inquiry</h2>
        <p className="text-xs text-slate-500 mt-1">Apply directly to our programs.</p>
      </div>

      {success ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
          <p className="text-sm font-bold text-slate-900">{success}</p>
          <Button variant="dark" size="sm" className="mt-4" onClick={onClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Phone Number *"
            placeholder="9876543210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            error={errors.phone}
          />
          <Input
            label="Email (optional)"
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />

          <Select
            label="Select Course *"
            options={[
              { value: '', label: 'Choose a course...' },
              ...courses.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={form.course_id}
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            error={errors.course_id}
          />

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">
              Message (optional)
            </label>
            <textarea
              className="w-full rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-semibold px-4 py-3 outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 transition-all resize-none"
              rows={3}
              placeholder="Any questions or preferences..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          {serverError && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{serverError}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">Submit Inquiry</Button>
        </form>
      )}
    </Modal>
  );
}
