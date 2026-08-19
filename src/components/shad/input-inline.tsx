import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { AddProducts } from "@/app/pages/dashboard/products/crud-operations/add-product";
import { useSearch } from "@/context/search-context";

type User = {
  name: string;
  avatar?: string;
};

type InputInlineProps = {
  user: User;
};

export function InputInline({ user }: InputInlineProps) {
  const { searchQuery, setSearchQuery } = useSearch();

  const initials = user.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="ml-auto flex items-center gap-3">
      <Field orientation="horizontal">
        <Input
          type="search"
          placeholder="Search name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-81"
        />
      <AddProducts />

      </Field>

      <Avatar className="size-9">
        <AvatarImage
          src={user.avatar}
          alt={user.name}
        />

        <AvatarFallback>
          {initials}
        </AvatarFallback>
      </Avatar>

      <Button variant="outline">
        Log out
      </Button>
    </div>
  );
}