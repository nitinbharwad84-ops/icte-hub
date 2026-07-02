import { cn } from '@/lib/utils/cn';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  className?: string;
}

export function Table<T>({ columns, data, keyExtractor, className }: TableProps<T>) {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className={cn('w-full text-sm', className)}>
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th key={col.key} className={cn('text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-400 pb-3 px-4', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={cn('py-3 px-4 text-slate-700', col.className)}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
