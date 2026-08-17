import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  ProductCategory,
  ProductFiltersProps,
  ProductStatusFilter,
} from "@/types/data-type";

const categories: ProductCategory[] = [
  "All",
  "Lighting",
  "Apparel",
  "Home",
  "Electronics",
  "Outdoor",
  "Stationery",
];

const statuses: ProductStatusFilter[] = [
  "All",
  "Active",
  "Draft",
  "Out of Stock",
  "Archived",
];

export function ProductFilters({
  category,
  status,
  priceRange,
  inStockOnly,
  productCount,
  sortDescending,
  onCategoryChange,
  onStatusChange,
  onPriceChange,
  onStockChange,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={category}
        onValueChange={(value) => onCategoryChange(value as ProductCategory)}
      >
        <SelectTrigger className="h-9 w-35">
          <span className="text-xs">Category:</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-1">
        {statuses.map((item) => {
          const active = status === item;
          return (
            <Button
              key={item}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              className={
                active
                  ? "h-9 rounded-full px-4"
                  : "h-9 rounded-full px-4 font-normal"
              }
              onClick={() => onStatusChange(item)}
            >
              {item}
            </Button>
          );
        })}
      </div>

      <div className="mx-1 hidden h-6 w-px bg-border md:block" />

      <Select value={priceRange} onValueChange={onPriceChange}>
        <SelectTrigger className="h-9 w-28.75">
          <span className="text-xs">Price</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0-500">All</SelectItem>
          <SelectItem value="0-50">$0-$50</SelectItem>
          <SelectItem value="50-100">$50-$100</SelectItem>
          <SelectItem value="100-250">$100-$250</SelectItem>
          <SelectItem value="250-500">$250-$500</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex h-9 items-center gap-2 rounded-md border px-3">
        <Switch
          id="in-stock-only"
          checked={inStockOnly}
          onCheckedChange={onStockChange}
        />

        <Label
          htmlFor="in-stock-only"
          className="cursor-pointer text-xs font-normal"
        >
          In stock only
        </Label>
      </div>

      {/* Result count */}

      <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
        <span>{productCount} products · sorted by Updated</span>

        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onSortChange}
          aria-label="Change product sort order"
        >
          <ChevronDown
            className={sortDescending ? "size-4" : "size-4 rotate-180"}
          />
        </Button>
      </div>
    </div>
  );
}
