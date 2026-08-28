import { Eye } from "lucide-react";
import { useState } from "react";
import { ImagePreviewDialog } from "./image-preview-dialog";

type ProductImagePreviewProps = {
  src: string;
  alt: string;
  className?: string;
};

export function ProductImagePreview({
  src,
  alt,
  className = "",
}: ProductImagePreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`group relative overflow-hidden ${className}`}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Preview ${alt}`}
          className="absolute left-1/2 top-1/2 z-10 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
        >
          <Eye className="size-4" />
        </button>
      </div>

      <ImagePreviewDialog
        image={open ? { src, alt } : null}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}