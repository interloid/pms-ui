import { useLocation } from "react-router-dom";

import { HeaderActions } from "./header-actions";
import type { HeaderProps } from "@/types/data-type";

const TITLES: Record<string, string> = {
  "/products": "Products",
  "/orders": "Orders",
  "/customers": "Customers",
  "/categories": "Categories",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function Header({
  user,
  productCount = 0,
}: HeaderProps) {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "Dashboard";

  return (
    <header className="flex min-h-16 items-center justify-between gap-2 border-b px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center">
        <h1 className="line-clamp-1 text-sm font-medium">
          {title}{" "}
          {pathname === "/products" && (
            <span className="text-sm font-normal text-muted-foreground">
              ({productCount})
            </span>
          )}
        </h1>
      </div>
      <HeaderActions user={user} />
    </header>
  );
}