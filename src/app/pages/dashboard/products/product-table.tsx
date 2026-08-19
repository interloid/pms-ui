import {
  Table,
  TableBody,
  TableHeader,
} from "@/components/ui/table";
import { ProductTableRow } from "./product-table-row";
import type { ProductTableProps } from "@/types/data-type";
import { EmptyProducts } from "@/components/shad/emptyProducts";

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
          <TableHeader></TableHeader>
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
              <EmptyProducts />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
