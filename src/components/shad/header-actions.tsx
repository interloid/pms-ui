import { useState } from "react";
import { ProductForm } from "@/app/pages/dashboard/products/Product-form";
import { useSearch } from "@/context/use-search";
import type { InputInlineProps } from "@/types/data-type";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoutDialog } from "@/components/shad/logout-dialog";
import { getInitials } from "@/lib/utils";


export function HeaderActions({ user }: InputInlineProps) {
  const { searchQuery, setSearchQuery, refresh } = useSearch();
  const [addOpen, setAddOpen] = useState(false);
  const initials = getInitials(user?.name ?? "");

  return (
    <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
      <Input
        type="search"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="hidden h-9 w-full cursor-pointer focus-visible:border-primary focus-visible:ring-primary/20 sm:flex sm:w-44 md:w-56 lg:w-72"
      />

      <ProductForm
        mode="add"
        open={addOpen}
        onOpenChange={setAddOpen}
        onProductCreated={refresh}
        trigger={
          <Button
            type="button"
            className="cursor-pointer whitespace-nowrap px-2.5 sm:px-4"
          >
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        }
      />

      <Avatar className="hidden size-9 lg:flex">
        <AvatarImage
          src={user?.avatar ?? undefined}
          alt={user?.name ?? "User"}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <LogoutDialog
        trigger={
          <Button
            variant="destructive"
            className="cursor-pointer bg-cancel-button-background! px-2.5 text-sm text-secondary hover:bg-destructive! sm:px-3"
          >
            Log out
          </Button>
        }
      />
    </div>
  );
}