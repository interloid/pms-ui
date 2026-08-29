import { Eye, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { ImagePreviewDialog } from "./image-preview-dialog";
import type { ProductImagePreviewProps } from "@/types/data-type";

export function ProductImagePreview({
  src,
  alt,
  className = "",
}: ProductImagePreviewProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Preview ${alt}`}
        disabled={isLoading || hasError}
        className={`group relative block overflow-hidden ${className}`}
      >
        <img
        loading="lazy"
          src={src}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`h-full w-full object-cover transition-all duration-200 ${
            isLoading ? "scale-95 opacity-0" : "scale-100 opacity-100"
          } group-hover:scale-[1.02]`}
        />
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center bg-muted">
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          </span>
        )}
        {hasError && (
          <span className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-[10px] font-medium text-muted-foreground">
              Failed to load image
            </span>
          </span>
        )}
        {!isLoading && !hasError && (
          <span className="pointer-events-none absolute inset-0 m-auto flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
            <Eye className="size-4" />
          </span>
        )}
      </button>
      <ImagePreviewDialog
        image={open ? { src, alt } : null}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}