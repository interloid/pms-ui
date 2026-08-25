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
import type { ProductCategory, ProductFiltersProps } from "@/types/data-type";
import { categories, statusFilters } from "@/types/data-type";
import { RxReset } from "react-icons/rx";

const priceRanges = [
  { value: "all", label: "All" },
  { value: "0-50", label: "$0-$50" },
  { value: "50-100", label: "$50-$100" },
  { value: "100-250", label: "$100-$250" },
  { value: "250-500", label: "$250-$500" },
  { value: "500-999999", label: "$500+" },
];

export function ProductFilters({
  category,
  status,
  priceRange,
  inStockOnly,
  productCount,
  sort,
  order,
  onCategoryChange,
  onStatusChange,
  onPriceChange,
  onStockChange,
  onSortChange,
  onReset,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={category}
        onValueChange={(value) => onCategoryChange(value as ProductCategory)}
      >
        <SelectTrigger className="h-9 w-35 hover:bg-primary-hover! hover:border-primary">
          <span className="text-xs">Category:</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions={false}
          className="w-36"
        >
          {categories.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className="hover:bg-primary-hover!"
            >
              {item.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-1">
        {statusFilters.map((item) => {
          const active = status === item.value;
          return (
            <Button
              key={item.value}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              className={
                active
                  ? "h-9 rounded-full px-4"
                  : "h-9 rounded-full px-4 font-normal hover:bg-primary-hover! hover:border-primary"
              }
              onClick={() => onStatusChange(item.value)}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
      <div className="mx-1 hidden h-6 w-px bg-border md:block" />
      <Select value={priceRange} onValueChange={onPriceChange}>
        <SelectTrigger className="h-9 w-32 hover:bg-primary-hover! hover:border-primary">
          <span className="text-xs">Price</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions={false}
          className="w-36"
        >
          {priceRanges.map((range) => (
            <SelectItem
              key={range.value}
              value={range.value}
              className="hover:bg-primary-hover!"
            >
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex h-9 items-center gap-2 rounded-md border px-3 hover:bg-primary-hover! hover:border-primary">
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

      <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
        <span>
          {productCount} products ·{" "}
          {sort === "updated"
            ? order === "desc"
              ? "Newest"
              : "Oldest"
            : order === "desc"
              ? "Highest price"
              : "Lowest price"}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 hover:bg-primary-hover! hover:border-primary!"
          onClick={() =>
            onSortChange(
              "price",
              sort === "price" && order === "asc" ? "desc" : "asc",
            )
          }
          aria-label={
            sort === "price" && order === "asc"
              ? "Sort price high to low"
              : "Sort price low to high"
          }
        >
          <ChevronDown
            className={`size-4 transition-transform ${
              sort === "price" && order === "desc" ? "rotate-180" : ""
            }`}
          />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 px-3 hover:border-primary hover:bg-primary-hover!"
          onClick={onReset}
          aria-label="Reset sorting"
        >
          <RxReset />
        </Button>
      </div>
    </div>
  );
}
