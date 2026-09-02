import { useSearch } from "@/context/use-search";
import type { HeaderActionsProps } from "@/types/data-type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { LogoutDialog } from "@/components/shad/logout-dialog";
import { AddProducts } from "@/app/pages/dashboard/products/crud-operations/add-product";
import { getInitials } from "@/lib/utils";
import { Button } from "../ui/button";


export function HeaderActions({
  user,
}: HeaderActionsProps) {
  const { searchQuery, setSearchQuery, refresh } = useSearch();
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
      <AddProducts onProductCreated={refresh} />

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
