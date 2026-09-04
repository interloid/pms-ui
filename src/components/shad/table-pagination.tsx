import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaginationProps } from "@/types/data-type";

export function TablePagination({
  page,
  pageSize,
  productCount,
  totalPages,
  setPage,
  setPageSize,
}: PaginationProps) {
  const lastPage = Math.max(totalPages, 1);

  const startItem = productCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, productCount);

  const isFirstPage = page <= 1;
  const isLastPage = page >= lastPage;
  const isEmpty = productCount === 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row py-4 sm:items-center sm:justify-between lg:px-2 pb-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => {
            setPageSize(Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-16.25 hover:border-primary hover:bg-primary-hover focus-visible:border-primary! focus-visible:ring-primary/20!">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem
                key={size}
                value={String(size)}
                className="hover:bg-primary-hover!"
              >
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="text-sm text-muted-foreground">
          {startItem}-{endItem} of {productCount}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8 hover:border-primary hover:bg-primary-hover!"
            disabled={isFirstPage || isEmpty}
            onClick={() => setPage(1)}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 hover:border-primary hover:bg-primary-hover!"
            disabled={isFirstPage || isEmpty}
            onClick={() => setPage((current) => current - 1)}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 hover:border-primary hover:bg-primary-hover!"
            disabled={isLastPage || isEmpty}
            onClick={() =>
              setPage((current) => Math.min(current + 1, lastPage))
            }
            aria-label="Go to next page"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 hover:border-primary hover:bg-primary-hover!"
            disabled={isLastPage || isEmpty}
            onClick={() => setPage(lastPage)}
            aria-label="Go to last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
