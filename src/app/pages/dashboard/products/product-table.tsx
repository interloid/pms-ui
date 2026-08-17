import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Product } from "@/types/data-type";

import { ProductTableRow } from "./product-table-row";

interface ProductTableProps {
  products: Product[];
  archiveId: string | null;

  onView: (product: Product) => void;
  onArchive: (id: string) => void;
  onCancelArchive: () => void;
  onConfirmArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

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
              <TableHead className="text-center">SKU ↕</TableHead>
              <TableHead className="min-w-55">PRODUCT NAME ↕</TableHead>
              <TableHead>CATEGORY ↕</TableHead>
              <TableHead className="text-right">PRICE ↕</TableHead>
              <TableHead className="text-right">STOCK ↕</TableHead>
              <TableHead>STATUS ↕</TableHead>
              <TableHead>UPDATED ↓</TableHead>
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
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
