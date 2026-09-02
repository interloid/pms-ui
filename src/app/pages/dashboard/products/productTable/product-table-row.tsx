import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import type { ApiProduct, ProductTableRowProps } from "@/types/data-type";
import { ProductImage } from "@/app/pages/dashboard/products/productTable/product-image";
import {
  formatDateTime,
  getStatusClassName,
  getStatusLabel,
} from "@/lib/converters";
import { useState } from "react";

function getPrimaryImage(product: ApiProduct) {
  return (
    product.images?.find((image) => image.is_primary)?.url ??
    product.images?.[0]?.url
  );
}

export function ProductTableRow({
  product,
  isArchiving,
  isDeleting,
  onEdit,
  onView,
  onArchive,
  onCancelArchive,
  onConfirmArchive,
  onDelete,
  onCancelDelete,
  onConfirmDelete,
}: ProductTableRowProps) {
  const primaryImage = getPrimaryImage(product);
  const [actionsOpen, setActionsOpen] = useState(false);

  if (isArchiving) {
    return (
      <TableRow className="bg-red-50 hover:bg-red-50">
        <TableCell
          colSpan={8}
          className="border-l-2 border-l-cancel-button-background py-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <ProductImage src={primaryImage} alt={product.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  Archive &quot;{product.name}&quot;?
                </p>
                <p className="text-sm text-muted-foreground">
                  It disappears from the active list.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelArchive}
                className="hover:bg-primary-hover hover:border-primary"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={onConfirmArchive}
              >
                Yes, archive
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  if (isDeleting) {
    return (
      <TableRow className="bg-red-50 hover:bg-red-50">
        <TableCell
          colSpan={8}
          className="border-l-2 border-l-cancel-button-background py-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <ProductImage src={primaryImage} alt={product.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  Delete &quot;{product.name}&quot;?
                </p>
                <p className="text-sm text-muted-foreground">
                  This permanently removes the product.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onCancelDelete}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={onConfirmDelete}
              >
                Yes, delete
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }
  return (
    <TableRow
      className="relative cursor-pointer hover:bg-primary-hover"
      onClick={onView}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <ProductImage src={primaryImage} alt={product.name} />
          <span className="hidden font-mono text-xs text-muted-foreground min-[420px]:inline">
            {product.sku}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <button
          type="button"
          onClick={onView}
          className="max-w-40 truncate text-center text-sm font-semibold hover:underline sm:max-w-none"
        >
          {product.name}
        </button>
      </TableCell>
      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
        {product.category_name}
      </TableCell>
      <TableCell className="text-center font-mono text-sm">
        ${Number(product.price).toFixed(2)}
      </TableCell>
      <TableCell className="text-center text-sm">{product.stock}</TableCell>
      <TableCell>
        <Badge variant="outline" className={getStatusClassName(product.status)}>
          {getStatusLabel(product.status)}
        </Badge>
      </TableCell>
      <TableCell className="hidden text-center text-xs text-muted-foreground md:table-cell">
        {formatDateTime(product.updated_at)}
      </TableCell>
      <TableCell
        className="relative z-20"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 hover:bg-primary-hover hover:border-primary focus-visible:primary-3 focus-visible:ring-primary/20"
            onClick={(event) => {
              event.stopPropagation();
              onView();
            }}
          >
            View
          </Button>
          <DropdownMenu open={actionsOpen} onOpenChange={setActionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8 hover:bg-primary-hover hover:border-primary focus-visible:primary-3 focus-visible:ring-primary/20"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Product actions</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              {product.status !== "archived" && (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();

                    setActionsOpen(false);
                    onArchive();
                  }}
                >
                  Archive
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();

                  setActionsOpen(false);
                  onEdit();
                }}
              >
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive"
                onSelect={(event) => {
                  event.preventDefault();

                  setActionsOpen(false);
                  onDelete();
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
