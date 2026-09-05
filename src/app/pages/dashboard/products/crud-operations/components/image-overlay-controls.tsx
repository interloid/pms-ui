import type { ImageOverlayControlsProps } from "@/types/data-type";

export function ImageOverlayControls({
  isPrimary,
  onSetPrimary,
}: ImageOverlayControlsProps) {
  return isPrimary ? (
    <span className="absolute bottom-1.5 left-1.5 z-20 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground shadow-sm">
      Primary
    </span>
  ) : (
    <button
      type="button"
      onClick={onSetPrimary}
      className="absolute bottom-1.5 left-1.5 z-20 rounded-full border bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-background hover:text-foreground"
    >
      Set primary
    </button>
  );
}