import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddProducts } from "@/app/pages/dashboard/products/crud-operations/add-product";
import { useSearch } from "@/context/search-context";
import { useAuth } from "@/hooks/useAuth";
import type { InputInlineProps } from "@/types/data-type";

export function InputInline({ user }: InputInlineProps) {
  const { searchQuery, setSearchQuery, refresh } = useSearch();
  const { logout } = useAuth();
  return (
    <div className="ml-auto flex items-center gap-3">
      <Field orientation="horizontal">
        <Input
          type="search"
          placeholder="Search name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-81 focus-visible:border-primary focus-visible:ring-primary/20 cursor-pointer"
        />
        <AddProducts onProductCreated={refresh} />
      </Field>
      <Avatar className="size-9">
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
      <Button variant="destructive" onClick={logout} className="hover:bg-destructive! text-secondary bg-red-500 cursor-pointer">
        Log out
      </Button>
    </div>
  );
}
