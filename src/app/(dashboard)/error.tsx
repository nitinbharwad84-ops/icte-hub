'use client';
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 mb-6 text-sm">An unexpected error occurred. Please try again.</p>
        <button onClick={reset} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-blue transition-all">
          Try Again
        </button>
      </div>
    </div>
  );
}
