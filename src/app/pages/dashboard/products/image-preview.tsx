import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ImagePreviewDialogProps } from "@/types/data-type";

export function ImagePreviewDialog({
  image,
  open,
  onOpenChange,
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-2">
        {image && (
          <div className="flex max-h-[80vh] items-center justify-center overflow-hidden rounded-md bg-muted">
            <img
              src={image.src}
              alt={image.alt}
              className="max-h-[75vh] max-w-full w-full object-contain"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}