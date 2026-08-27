import { AddProducts } from "@/app/pages/dashboard/products/crud-operations/add-product";
import { useSearch } from "@/context/search-context";
import { useAuth } from "@/hooks/useAuth";
import type { InputInlineProps } from "@/types/data-type";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function HeaderActions({ user }: InputInlineProps) {
  const { searchQuery, setSearchQuery, refresh } = useSearch();
  const { logout } = useAuth();

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
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            className="cursor-pointer bg-red-500! text-secondary hover:bg-destructive! px-2.5 text-sm sm:px-4"
          >
            Log out
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[16px]">
              Are you sure you want to log out?
            </DialogTitle>
            <DialogDescription>
              You will be signed out of your account and redirected to the login
              page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={logout}
              className="cursor-pointer bg-red-500 text-secondary hover:bg-destructive"
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
