import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = 10;

export function ProductListSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="px-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-6 items-center gap-4 border-b px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
        <div className="divide-y">
          {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-6 items-center gap-4 px-4 py-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-md" />

                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 pb-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-1">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
