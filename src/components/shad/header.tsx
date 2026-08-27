import { HeaderActions } from "./header-actions";
import type { HeaderProps } from "@/types/data-type";

export default function Header({
  user,
  productCount = 0,
}: HeaderProps) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-2 border-b px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center">
        <h1 className="line-clamp-1 text-sm font-medium">
          Products{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({productCount})
          </span>
        </h1>
      </div>
      <HeaderActions user={user} />
    </header>
  );
}