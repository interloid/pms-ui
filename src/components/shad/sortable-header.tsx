import { ArrowDown, ArrowUp } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import type { SortableTableHeadProps } from "@/types/data-type";

export function SortableHeader({
  label,
  field,
  sort,
  onSort,
  className,
}: SortableTableHeadProps) {
  const isActive = sort.field === field;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="flex w-full items-center justify-center gap-1 text-xs font-medium hover:text-foreground"
      >
        <span>{label}</span>

        <span className="flex flex-col -space-y-1">
          <ArrowUp
            className={`size-3 ${
              isActive && sort.order === "asc"
                ? "text-foreground"
                : "text-muted-foreground/40"
            }`}
          />
          <ArrowDown
            className={`size-3 ${
              isActive && sort.order === "desc"
                ? "text-foreground"
                : "text-muted-foreground/40"
            }`}
          />
        </span>
      </button>
    </TableHead>
  );
}
