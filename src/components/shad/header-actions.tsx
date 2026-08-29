import { AddProducts } from "@/app/pages/dashboard/products/crud-operations/add-product";
import { useSearch } from "@/context/search-context";
import type { InputInlineProps } from "@/types/data-type";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoutDialog } from "@/components/shad/logout-dialog";

export function HeaderActions({ user }: InputInlineProps) {
  const { searchQuery, setSearchQuery, refresh } = useSearch();

  return (
    <div className="ml-auto flex items-center gap-2 sm:gap-3">
      <Field orientation="horizontal" className="gap-2 sm:gap-3">
        <Input
          type="search"
          placeholder="Search name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-40 cursor-pointer focus-visible:border-primary focus-visible:ring-primary/20 sm:w-56 md:w-72 lg:w-81"
        />

        <AddProducts onProductCreated={refresh} />
      </Field>

      <Avatar className="hidden size-9 sm:flex">
        <AvatarImage
          src={user?.avatar ?? undefined}
          alt={user?.name ?? "User"}
        />
        <AvatarFallback>
          {user?.name
            ?.trim()
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>

      <LogoutDialog
        trigger={
          <Button
            variant="destructive"
            className="cursor-pointer bg-cancel-button-background! px-2.5 text-sm text-secondary hover:bg-destructive! sm:px-4"
          >
            Log out
          </Button>
        }
      />
    </div>
  );
}