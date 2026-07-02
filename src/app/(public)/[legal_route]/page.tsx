import { notFound } from 'next/navigation';
import { Metadata } from 'next';

const legalPages: Record<string, { title: string; content: string }> = {
  privacy: {
    title: 'Privacy Policy',
    content: 'Your privacy is important to us. ICTE Hub collects and uses your personal information (name, phone, email) solely for the purpose of connecting you with partner universities and providing counseling services. We do not share your data with third parties without your consent. You may request deletion of your data at any time by contacting us at info@ictehub.com.',
  },
  terms: {
    title: 'Terms of Service',
    content: 'By using ICTE Hub, you agree to provide accurate information for inquiry purposes. ICTE Hub acts as a中介 between students and partner universities. While we strive to maintain accurate listings, we do not guarantee admission outcomes. All commission-based partnerships are透明ly disclosed.',
  },
  disclaimer: {
    title: 'Disclaimer',
    content: 'The information provided on ICTE Hub is for general informational purposes only. College listings, fees, and course details are subject to change at the discretion of partner institutions. ICTE Hub is not responsible for any decisions made based on the information provided on this platform.',
  },
};

export function generateStaticParams() {
  return Object.keys(legalPages).map((route) => ({ legal_route: route }));
}

export async function generateMetadata({ params }: { params: Promise<{ legal_route: string }> }): Promise<Metadata> {
  const { legal_route } = await params;
  const page = legalPages[legal_route];
  if (!page) return { title: 'Not Found' };
  return { title: `${page.title} - ICTE Hub` };
}

export default async function LegalPage({ params }: { params: Promise<{ legal_route: string }> }) {
  const { legal_route } = await params;
  const page = legalPages[legal_route];
  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-card p-8 md:p-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">{page.title}</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed">{page.content}</p>
        </div>
      </div>
    </div>
  );
}
