import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { ProductImageProps } from "@/types/data-type";

export function ProductImage({
  src,
  alt,
  className = "",
}: ProductImageProps) {
  const [isLoading, setIsLoading] = useState(Boolean(src));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(Boolean(src));
    setHasError(false);
  }, [src]);
  if (!src || hasError) {
    return (
      <div
        className={`size-10 shrink-0 overflow-hidden rounded-md border bg-muted ${className}`}
      >
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

  return (
    <div
      className={`relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted ${className}`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
          <Spinner className="size-4" />
        </div>
      )}

      <img
        src={src}
        alt={alt ?? "Product"}
        className={`size-full object-cover transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}