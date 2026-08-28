import { Eye } from "lucide-react";
import { useState } from "react";
import { ImagePreviewDialog } from "./image-preview-dialog";
import type { ProductImagePreviewProps } from "@/types/data-type";

export function ProductImagePreview({
  src,
  alt,
  className = "",
}: ProductImagePreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Preview ${alt}`}
        className={`group relative block overflow-hidden ${className}`}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute inset-0 m-auto flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          <Eye className="size-4" />
        </span>
      </button>

      <ImagePreviewDialog
        image={open ? { src, alt } : null}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}