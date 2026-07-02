import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'ICTE Hub - Find Your Right University',
  description: 'Compare colleges, get free counseling, and find the right university for your future with ICTE Hub.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
