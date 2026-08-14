import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function CustomSidebarTrigger({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { state, toggleSidebar } = useSidebar();

  const isCollapsed = state === "collapsed";

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={
        isCollapsed
          ? "Expand sidebar"
          : "Collapse sidebar"
      }
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {isCollapsed ? (
        <ChevronRight className="size-4" />
      ) : (
        <ChevronLeft className="size-4" />
      )}
    </button>
  );
}