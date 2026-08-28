export function ImageUploadProgress() {
  return (
    <div className="relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-md border bg-muted">
      <span className="text-[11px] font-medium text-muted-foreground">
        Uploading...
      </span>
      <div className="h-1 w-16 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
      </div>
    </div>
  );
}