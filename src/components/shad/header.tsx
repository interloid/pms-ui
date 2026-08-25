import type { AuthUser } from "@/types/auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { InputInline } from "@/components/shad/input-inline";

type HeaderProps = {
  user: AuthUser | null;
  productCount?: number;
};

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
      <InputInline user={user} />
    </header>
  );
}
