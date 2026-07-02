import { Skeleton } from '@/components/ui/Skeleton';

export default function CollegesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>
      <Skeleton className="h-5 w-96 mb-8" />
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-80 rounded-[2rem]" />)}
      </div>
    </div>
  );
}
