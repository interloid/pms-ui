import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { HeaderActions } from "./header-actions";
import type { HeaderProps } from "@/types/data-type";

export default function Header({ user, productCount = 0 }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b px-4">
      <div className="flex w-3/4 items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">Products</BreadcrumbPage>

              <span className="text-sm text-muted-foreground">
                ({productCount})
              </span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <HeaderActions user={user} />
    </header>
  );
}
