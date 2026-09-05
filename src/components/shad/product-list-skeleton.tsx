export function ProductListSkeleton() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-24 animate-shimmer bg-white/40" />
    </div>
  );
}