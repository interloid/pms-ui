import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

export function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 shrink-0 md:hidden border-2px"
      onClick={(event) => {
        event.stopPropagation();
        toggleSidebar();
      }}
      aria-label="Open navigation menu"
    >
      <Menu className="size-5" />
    </Button>
  );
}
