'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

interface InstituteCourse {
  id: string;
  course_name: string;
  institute_id: string;
  duration: string;
  fee: number | null;
  mode: string;
  description: string | null;
  status: string;
  created_at: string;
  institute?: { id: string; college_name: string };
}

interface Institute {
  id: string;
  college_name: string;
}

const MODE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const emptyForm = {
  course_name: '',
  institute_id: '',
  duration: '',
  fee: '',
  mode: 'online',
  description: '',
  status: 'active',
};

export default function InstituteCoursesPage() {
  const [courses, setCourses] = useState<InstituteCourse[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<InstituteCourse | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await supabase
      .from('institute_courses')
      .select('id, course_name, institute_id, duration, fee, mode, description, status, created_at')
      .order('created_at', { ascending: false });
    if (fetchError) { setError(fetchError.message); setLoading(false); return; }

    // Enrich with institute names
    const instituteIds = [...new Set(data?.map(c => c.institute_id).filter(Boolean))] as string[];
    const { data: institutesData } = await supabase
      .from('partner_inquiries')
      .select('id,college_name')
      .in('id', instituteIds.length > 0 ? instituteIds : ['no-op']);
    const instituteMap = new Map(institutesData?.map(i => [i.id, i]) || []);

    setCourses((data || []).map(c => ({
      ...c,
      institute: c.institute_id ? instituteMap.get(c.institute_id) : undefined,
    })));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    supabase.from('partner_inquiries').select('id,college_name').order('college_name')
      .then(({ data }) => setInstitutes(data || []), console.error);
    fetchCourses();
  }, [fetchCourses, supabase]);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (course: InstituteCourse) => {
    setEditingCourse(course);
    setForm({
      course_name: course.course_name,
      institute_id: course.institute_id,
      duration: course.duration,
      fee: course.fee?.toString() || '',
      mode: course.mode,
      description: course.description || '',
      status: course.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const payload = {
      course_name: form.course_name,
      institute_id: form.institute_id || null,
      duration: form.duration,
      fee: form.fee ? Number(form.fee) : null,
      mode: form.mode,
      description: form.description || null,
      status: form.status,
    };

    if (editingCourse) {
      const { error: updateError } = await supabase
        .from('institute_courses')
        .update(payload)
        .eq('id', editingCourse.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      const { error: insertError } = await supabase
        .from('institute_courses')
        .insert(payload);
      if (insertError) { setError(insertError.message); setSaving(false); return; }
    }

    setSaving(false);
    setModalOpen(false);
    fetchCourses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const { error: deleteError } = await supabase
      .from('institute_courses')
      .delete()
      .eq('id', id);
    if (deleteError) { setError(deleteError.message); return; }
    fetchCourses();
  };

  const filteredCourses = courses.filter(c =>
    c.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modeColors: Record<string, 'blue' | 'indigo' | 'purple'> = {
    online: 'blue',
    offline: 'indigo',
    hybrid: 'purple',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Institute Courses</h1>
          <p className="text-sm text-slate-500 mt-1">{courses.length} total courses</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" /> Add Course
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text" placeholder="Search by course name..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm outline-none focus:border-brand-blue/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No courses found</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Course Name</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Institute</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Duration</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Fee</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Mode</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Status</th>
                  <th className="text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{course.course_name}</td>
                    <td className="p-4 text-slate-600">{course.institute?.college_name || '—'}</td>
                    <td className="p-4 text-slate-600">{course.duration}</td>
                    <td className="p-4 text-slate-600">
                      {course.fee != null ? `₹${course.fee.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-4">
                      <Badge color={modeColors[course.mode] || 'slate'}>
                        {course.mode.charAt(0).toUpperCase() + course.mode.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge color={course.status === 'active' ? 'emerald' : 'slate'}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="text-slate-400 hover:text-brand-blue transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="max-w-xl">
        <div className="p-8">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6">
            {editingCourse ? 'Edit Course' : 'Add Course'}
          </h2>
          <div className="space-y-4">
            <Input
              label="Course Name *"
              value={form.course_name}
              onChange={(e) => setForm({ ...form, course_name: e.target.value })}
              placeholder="e.g. BCA"
            />
            <Select
              label="Institute"
              options={[
                { value: '', label: 'Select institute...' },
                ...institutes.map(i => ({ value: i.id, label: i.college_name })),
              ]}
              value={form.institute_id}
              onChange={(e) => setForm({ ...form, institute_id: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Duration *"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 3 Years"
              />
              <Input
                label="Fee"
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: e.target.value.replace(/\D/g, '') })}
                placeholder="e.g. 50000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Mode"
                options={MODE_OPTIONS}
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              />
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Course description..."
                rows={3}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-semibold px-4 py-3 outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/15 transition-all resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving} disabled={!form.course_name || !form.duration}>
              {editingCourse ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
