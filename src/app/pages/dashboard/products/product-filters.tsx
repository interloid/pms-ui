import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductCategory, ProductFiltersProps } from "@/types/data-type";
import { categories, statusFilters } from "@/types/data-type";
import { ResetForwardIcon } from "@/components/icons/reset-forward";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  onCategoryChange,
  onStatusChange,
  onPriceChange,
  onReset,
}: ProductFiltersProps) {
  const isDefaultFilters =
    category === "All" && status === "All" && priceRange === "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={category}
        onValueChange={(value) => onCategoryChange(value as ProductCategory)}
      >
        <SelectTrigger className="h-9 w-fit hover:bg-primary-hover! hover:border-primary">
          <span className="text-xs">Category:</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions={false}
          className="w-fit"
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
      <div className="flex flex-wrap items-center gap-1">
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
                  ? "h-9 rounded-full px-3 sm:px-4"
                  : "h-9 rounded-full px-3 font-normal hover:bg-primary-hover! hover:border-primary sm:px-4"
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
        <SelectTrigger className="h-9 w-fit hover:bg-primary-hover! hover:border-primary">
          <span className="text-xs">Price</span>
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions={false}
          className="w-fit"
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
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-3 hover:border-primary hover:bg-primary-hover!"
              onClick={onReset}
              aria-label="Reset filters"
              disabled={isDefaultFilters}
            >
              <ResetForwardIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Reset filters</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
