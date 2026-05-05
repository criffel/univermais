export function TableSkeleton() {
  return (
    <div className="card p-4">
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-slate-200/70" />
        ))}
      </div>
    </div>
  );
}
