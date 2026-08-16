export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-white/5 rounded-xl" style={{ width: `${80 + (i % 3) * 7}%` }} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
      <div className="h-5 bg-white/5 rounded w-1/3" />
      <div className="h-8 bg-white/5 rounded w-2/3" />
      <div className="h-4 bg-white/5 rounded w-full" />
      <div className="h-4 bg-white/5 rounded w-4/5" />
    </div>
  );
}
