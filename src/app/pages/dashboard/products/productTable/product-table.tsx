import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductTableRow } from "./product-table-row";
import { SortableHeader } from "@/components/shad/sortable-header";
import EmptyProductTableRow from "@/components/shad/empty-products";
import type { ProductTableProps } from "@/types/data-type";

export function ProductTable({
  products,
  archiveId,
  deleteId,
  sort,
  onSort,
  onView,
  onEdit,
  onArchive,
  onCancelArchive,
  onConfirmArchive,
  onDelete,
  onCancelDelete,
  onConfirmDelete,
}: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table className="text-center">
          <TableHeader>
            <TableRow className="bg-muted/50 text-xs text-muted-text hover:bg-muted/50">
              <TableHead className="text-center">SKU</TableHead>
              <TableHead className="text-center">PRODUCT NAME</TableHead>
              <TableHead className="hidden text-center md:table-cell">
                CATEGORY
              </TableHead>
              <SortableHeader
                label="PRICE"
                field="price"
                sort={sort}
                onSort={onSort}
              />
              <SortableHeader
                label="STOCK"
                field="stock"
                sort={sort}
                onSort={onSort}
              />
              <SortableHeader
                label="STATUS"
                field="status"
                sort={sort}
                onSort={onSort}
              />
              <SortableHeader
                label="UPDATED"
                field="updated"
                sort={sort}
                onSort={onSort}
                className="hidden md:table-cell"
              />
              <TableHead className="text-center">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  isArchiving={archiveId === product.id}
                  isDeleting={deleteId === product.id}
                  onView={() => onView(product)}
                  onEdit={() => onEdit(product)}
                  onArchive={() => onArchive(product.id)}
                  onCancelArchive={onCancelArchive}
                  onConfirmArchive={() => onConfirmArchive(product.id)}
                  onDelete={() => onDelete(product.id)}
                  onCancelDelete={onCancelDelete}
                  onConfirmDelete={() => onConfirmDelete(product.id)}
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
