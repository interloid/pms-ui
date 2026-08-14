import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "../ui/breadcrumb";
import {InputInline}  from "@/components/shad/input-inline";

type HeaderProps = {
  user: {
    name: string;
    avatar?: string;
  };
};

export default function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b px-4">
      <div className="flex w-3/4 items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">
                Products
              </BreadcrumbPage>

              <span>42 items</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <InputInline user={user} />
    </header>
  );
}