'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createLeadAction } from '@/lib/actions/leads';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  college_ids: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

interface CollegeOption {
  id: string;
  name: string;
}

interface InquiryModalProps {
  open: boolean;
  onClose: () => void;
  colleges: CollegeOption[];
}

export function InquiryModal({ open, onClose, colleges }: InquiryModalProps) {
  const [form, setForm] = useState<FormData>({ name: '', phone: '', email: '', college_ids: [] });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const toggleCollege = (id: string) => {
    setForm((prev) => ({
      ...prev,
      college_ids: prev.college_ids.includes(id)
        ? prev.college_ids.filter((c) => c !== id)
        : [...prev.college_ids, id],
    }));
  };

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
      setForm({ name: '', phone: '', email: '', college_ids: [] });
    } else {
      setServerError(typeof res.error === 'string' ? res.error : 'Submission failed. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-slate-900">Request Information</h2>
        <p className="text-xs text-slate-500 mt-1">Fill in your details and select colleges you're interested in.</p>
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

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
              Interested Colleges
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {colleges.map((college) => (
                <label
                  key={college.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.college_ids.includes(college.id)}
                    onChange={() => toggleCollege(college.id)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">{college.name}</span>
                </label>
              ))}
            </div>
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
