import { AlertCircle } from "lucide-react";
import type { ImageError } from "@/types/data-type";

interface ImageErrorBannerProps {
  error: ImageError;
}

export function ImageErrorBanner({
  error: { message, fileName, fileSize, details },
}: ImageErrorBannerProps) {
  const formattedSize =
    fileSize !== undefined
      ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
      : undefined;

  return (
    <div className="flex gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-destructive">{message}</p>
        {details && (
          <p className="mt-1 text-xs text-muted-foreground">
            {fileName && formattedSize
              ? `${fileName}(${formattedSize}) ${details.replace(/^Image size /, "")}`
              : details}
          </p>
        )}
      </div>
    </div>
  );
}
