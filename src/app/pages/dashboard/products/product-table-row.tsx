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
import type { Product, ProductTableRowProps } from "@/types/data-type";
import { ProductImage } from "./product-image";

function getStatusClassName(status: Product["status"]) {
  switch (status) {
    case "Active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Draft":
      return "border-slate-200 bg-slate-50 text-slate-600";

    case "Out of Stock":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "Archived":
      return "border-slate-200 bg-slate-50 text-slate-500";

    default:
      return "";
  }
}

function getPrimaryImage(product: Product) {
  return product.images?.find((image) => image.isPrimary)?.url;
}

export function ProductTableRow({
  product,
  isArchiving,
  onView,
  onArchive,
  onCancelArchive,
  onConfirmArchive,
  onDelete,
}: ProductTableRowProps) {
  const primaryImage = getPrimaryImage(product);

  if (isArchiving) {
    return (
      <TableRow className="bg-red-50 hover:bg-red-50">
        <TableCell colSpan={8} className="border-l-2 border-l-red-500 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ProductImage src={primaryImage} alt={product.name} />

              <div>
                <p className="text-sm font-medium">Archive “{product.name}”?</p>

                <p className="text-sm text-muted-foreground">
                  It disappears from the active list.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onCancelArchive}>
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

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <ProductImage src={primaryImage} alt={product.name} />

          <span className="font-mono text-xs text-muted-foreground">
            {product.sku}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <button
          type="button"
          onClick={onView}
          className="text-left text-sm font-semibold hover:underline"
        >
          {product.name}
        </button>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {product.category}
      </TableCell>

      <TableCell className="text-right font-mono text-sm">
        ${product.price.toFixed(2)}
      </TableCell>

      <TableCell className="text-right text-sm">{product.stock}</TableCell>

      <TableCell>
        <Badge variant="outline" className={getStatusClassName(product.status)}>
          {product.status}
        </Badge>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {product.updatedAt}
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8" onClick={onView}>
            View
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Product actions</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {product.status !== "Archived" && (
                <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>
              )}

              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
