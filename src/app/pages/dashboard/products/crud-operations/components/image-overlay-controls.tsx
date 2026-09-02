import type { ImageOverlayControlsProps } from "@/types/data-type";

export function ImageOverlayControls({
  isPrimary,
  onSetPrimary,
}: ImageOverlayControlsProps) {
  return isPrimary ? (
    <span className="pointer-events-none absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground shadow-sm">
      Primary
    </span>
  ) : (
    <button
      type="button"
      onClick={onSetPrimary}
      className="absolute bottom-2 left-2 z-10 rounded-md bg-background/90 px-2 py-1 text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
    >
      Set primary
    </button>
  );
}
