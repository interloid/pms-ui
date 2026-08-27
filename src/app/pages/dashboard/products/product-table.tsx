import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductTableRow } from "./product-table-row";
import type { ProductTableProps } from "@/types/data-type";
import EmptyProductTableRow from "@/components/shad/empty-products";

export function ProductTable({
  products,
  archiveId,
  onView,
  onArchive,
  onCancelArchive,
  onConfirmArchive,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 text-muted-text text-xs">
              <TableHead className="text-center">SKU</TableHead>
              <TableHead className="min-w-55">PRODUCT NAME</TableHead>
              <TableHead>CATEGORY</TableHead>
              <TableHead className="text-right">PRICE</TableHead>
              <TableHead className="text-right">STOCK</TableHead>
              <TableHead>STATUS </TableHead>
              <TableHead>UPDATED </TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  isArchiving={archiveId === product.id}
                  onView={() => onView(product)}
                  onArchive={() => onArchive(product.id)}
                  onCancelArchive={onCancelArchive}
                  onConfirmArchive={() => onConfirmArchive(product.id)}
                  onDelete={() => onDelete(product.id)}
                />
              ))
            ) : (
              <EmptyProductTableRow />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
