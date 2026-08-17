export function ProductImage({ src, alt }: { src?: string; alt?: string }) {
  if (src) {
    return (
      <div className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
        <img
          src={src}
          alt={alt ?? "Product"}
          className="size-full object-cover"
        />
      </div>
    );
  }
  return (
    <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
      <div
        className="size-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 6px)",
        }}
      />
    </div>
  );
}
