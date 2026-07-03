'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { CollegeCard } from '@/components/shared/CollegeCard';
import { StatsCounter } from '@/components/shared/StatsCounter';
import { CategoryTile } from '@/components/shared/CategoryTile';
import { InquiryModal } from '@/components/shared/InquiryModal';
import { InstituteInquiryModal } from '@/components/shared/InstituteInquiryModal';
import { IcteLogo } from '@/components/shared/IcteLogo';
import { CATEGORIES, NAV_ITEMS } from '@/lib/utils/constants';
import { getSessionId, getSource } from '@/lib/utils/session';
import { Search, Star, GraduationCap, CheckCircle, MapPin, ArrowRight } from 'lucide-react';
import { createLeadAction } from '@/lib/actions/leads';

interface College {
  id: string;
  name: string;
  mode: string;
  location: string;
  courses_offered: string[];
  logo_url?: string;
}

interface Course {
  id: string;
  name: string;
  duration: string;
  fees: number;
}

interface HomeContentProps {
  colleges: College[];
  courses: Course[];
  collegeCount: number;
  courseCount: number;
}

export function HomeContent({ colleges, courses, collegeCount, courseCount }: HomeContentProps) {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [instituteInquiryOpen, setInstituteInquiryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [stickyVisible, setStickyVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [selectedCollegeForm, setSelectedCollegeForm] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sectionIds = ['universities', 'courses', 'programs', 'get-help'];
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const collegeOptions = colleges.map((c) => ({ id: c.id, name: c.name }));
  const topColleges = colleges.slice(0, 3);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (modeFilter !== 'All') params.set('mode', modeFilter);
    router.push(`/colleges?${params.toString()}`);
  };

  const handleSubmit = async () => {
    const result = await createLeadAction({
      name: formName,
      phone: formPhone,
      email: formEmail || undefined,
      college_ids: selectedCollegeForm.length > 0 ? selectedCollegeForm : undefined,
    });
    if (result.success) {
      setFormName(''); setFormPhone(''); setFormEmail(''); setSelectedCollegeForm([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  const navLinks = NAV_ITEMS;

  return (
    <>
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 30px) scale(1.05); }
        }
        .animate-blob { animation: blob 10s ease-in-out infinite; }
        .animate-blob-delayed { animation: blob 13s ease-in-out infinite reverse; }
        .animate-blob-slow { animation: blob 8s ease-in-out infinite 2s; }
      `}</style>

      {/* ============ SECTION 1: HERO ============ */}
      <section ref={heroRef} className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob-delayed" />
          <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob-slow" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Find the Right University For Your Future
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-2xl lg:mx-0 mx-auto">
                Discover accredited partner colleges offering distance, online, and offline degree programs. Request a free counseling session and secure your admission today.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button onClick={() => setInquiryOpen(true)}>
                  Get Free Consultation
                </Button>
                <Link href="/colleges">
                  <Button variant="secondary">Browse Colleges</Button>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <IcteLogo size={80} className="mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 9: STICKY SUB-NAVIGATION ============ */}
      <div className={`sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-300 ${stickyVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 py-3 overflow-x-auto">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeSection === link.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ============ SECTION 2: STATS COUNTER ============ */}
      <section id="universities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card glass className="p-8 text-center">
            <div className="text-4xl font-extrabold text-indigo-600">
              <StatsCounter end={collegeCount} suffix="+" />
            </div>
            <p className="mt-2 text-sm font-bold text-slate-500 uppercase tracking-wider">Partner Universities</p>
          </Card>
          <Card glass className="p-8 text-center">
            <div className="text-4xl font-extrabold text-cyan-600">
              <StatsCounter end={courseCount} suffix="+" />
            </div>
            <p className="mt-2 text-sm font-bold text-slate-500 uppercase tracking-wider">Programs & Courses</p>
          </Card>
          <Card glass className="p-8 text-center">
            <div className="text-4xl font-extrabold text-emerald-600">100%</div>
            <p className="mt-2 text-sm font-bold text-slate-500 uppercase tracking-wider">Free Service</p>
          </Card>
        </div>
      </section>

      {/* ============ SECTION 3: TOP RECOMMENDATIONS ============ */}
      {topColleges.length > 0 && (
        <section id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Card glass className="p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full border border-amber-200">
                <Star className="w-3 h-3" />
                TOP RECOMMENDATIONS
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topColleges.map((college) => (
                <button
                  key={college.id}
                  onClick={() => setInquiryOpen(true)}
                  className="text-left w-full p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all bg-white/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {college.logo_url ? (
                      <img src={college.logo_url} alt={college.name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-extrabold text-slate-500">
                        {college.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{college.name}</p>
                      <Badge color={college.mode === 'Online' ? 'cyan' : 'indigo'} className="rounded-full mt-1">
                        {college.mode}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-medium">{college.location}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* ============ SECTION 4: SMART UNIVERSITY FINDER ============ */}
      <section className="bg-slate-900 py-20 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Find Your Perfect Program</h2>
          <p className="text-slate-400 mb-8">Search through our extensive list of partner colleges and degree programs.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by keyword, program, or college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="rounded-xl bg-white/10 border border-white/20 text-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
            >
              <option value="All" className="text-slate-900">All Modes</option>
              <option value="Online" className="text-slate-900">Online</option>
              <option value="Offline" className="text-slate-900">Offline</option>
            </select>
            <Button onClick={handleSearch} className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* ============ SECTION 5: FEATURED UNIVERSITIES GRID ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Universities</h2>
          <Link href="/colleges" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
            View All Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {colleges.map((college) => (
            <CollegeCard key={college.id} college={college} onInquire={() => setInquiryOpen(true)} />
          ))}
        </div>
      </section>

      {/* ============ SECTION 6: BROWSE BY CATEGORY ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-10 text-center">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryTile key={cat.abbr} abbr={cat.abbr} name={cat.name} icon={cat.icon} />
          ))}
        </div>
      </section>

      {/* ============ SECTION 7: DEGREE PROGRAMS (conditional) ============ */}
      {courses.length > 0 && (
        <section id="programs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-10">Degree Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">{course.name}</h3>
                  <div className="space-y-1.5 text-sm text-slate-600">
                    <p><span className="font-bold">Duration:</span> {course.duration}</p>
                    {course.fees && (
                      <p><span className="font-bold">Fees:</span> ₹{course.fees.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <Button onClick={() => setInstituteInquiryOpen(true)} className="mt-6 w-full">
                  Enroll Now
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ============ SECTION 8: INLINE CTA / CONTACT ============ */}
      <section id="get-help" className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
                Get <span className="text-emerald-400">Free</span> Counseling
              </h2>
              <p className="text-slate-400 mb-8">Talk to our academic advisors and find the perfect program for your career goals.</p>
              <ul className="space-y-4">
                {[
                  'Get direct admission updates in partner universities',
                  'Compare online degrees vs offline structures',
                  'No charges or service commission billed to students',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-semibold">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="p-8">
              <h3 className="text-lg font-extrabold text-slate-900 mb-6">Request a Callback</h3>
              <div className="space-y-4">
                <Input
                  label="Full Name *"
                  placeholder="John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  dark={false}
                />
                <Input
                  label="Phone Number *"
                  placeholder="9876543210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  dark={false}
                />
                <Input
                  label="Email (optional)"
                  placeholder="john@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  dark={false}
                />
                {colleges.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                      Interested Colleges
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {colleges.map((college) => (
                        <label key={college.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedCollegeForm.includes(college.id)}
                            onChange={() =>
                              setSelectedCollegeForm((prev) =>
                                prev.includes(college.id) ? prev.filter((c) => c !== college.id) : [...prev, college.id]
                              )
                            }
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-semibold text-slate-700">{college.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {showSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl">
                    Inquiry submitted successfully! We'll contact you shortly.
                  </div>
                )}
                <Button className="w-full" onClick={handleSubmit}>
                  Submit Inquiry
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} colleges={collegeOptions} />
      <InstituteInquiryModal
        open={instituteInquiryOpen}
        onClose={() => setInstituteInquiryOpen(false)}
        courses={courses.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
