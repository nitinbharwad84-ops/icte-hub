import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-brand-blue mb-4">404</div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Page Not Found</h2>
        <p className="text-slate-500 mb-8 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-blue transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
