import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatStatus } from "@/lib/converters";
import type { ProductTableRowProps } from "@/types/data-type";

export function ProductTable({
  product,
  isArchiving,
  onView,
  onArchive,
  onCancelArchive,
  onConfirmArchive,
  onDelete,
}: ProductTableRowProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-mono text-xs">
            {product.sku}
          </TableCell>
          <TableCell className="font-medium">{product.name}</TableCell>
          <TableCell>{product.category}</TableCell>
          <TableCell>${product.price.toFixed(2)}</TableCell>
          <TableCell>{product.stock}</TableCell>
          <TableCell>{formatStatus(product.status)}</TableCell>
          <TableCell className="text-right text-muted-foreground">
            {product.updatedAt}
          </TableCell>
          <TableCell className="text-right">
            ...actions...
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}