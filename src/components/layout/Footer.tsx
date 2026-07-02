import Link from 'next/link';
import { IcteLogo } from '@/components/shared/IcteLogo';
import { Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 inline-block mb-4"><IcteLogo size={36} /></div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">Find the right university for your future. Accompanying you at every step of your educational roadmap.</p>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/colleges" className="text-sm text-slate-400 hover:text-white transition-colors">Universities</Link></li>
              <li><Link href="/check-status" className="text-sm text-slate-400 hover:text-white transition-colors">Check Status</Link></li>
              <li><Link href="/partner-with-us" className="text-sm text-slate-400 hover:text-white transition-colors">Partner With Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-slate-400 hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400"><Phone className="w-4 h-4 text-slate-500" /> +91 XXXXX XXXXX</li>
              <li className="flex items-center gap-2 text-sm text-slate-400"><Mail className="w-4 h-4 text-slate-500" /> info@ictehub.com</li>
              <li className="flex items-center gap-2 text-sm text-slate-400"><MapPin className="w-4 h-4 text-slate-500" /> New Delhi, India</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} ICTE Hub. All rights reserved.</p>
          <p className="text-xs text-slate-600">Built with care in India</p>
        </div>
      </div>
    </footer>
  );
}
