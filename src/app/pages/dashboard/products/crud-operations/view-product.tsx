import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/data-type";

type ProductViewProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
};

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

export function ProductView({
  product,
  open,
  onOpenChange,
  onEdit,
}: ProductViewProps) {
  if (!product) {
    return null;
  }

  function DetailLabel({ children }: { children: React.ReactNode }) {
    return <span className="text-muted-foreground">{children}</span>;
  }

  function DetailValue({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) {
    return <span className={className}>{children}</span>;
  }

  const primaryImage =
    product.images?.find((image) => image.isPrimary) ?? product.images?.[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 sm:max-w-xl">
        {/* Header */}
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-[15px] font-semibold">
                {product.name}
              </SheetTitle>

              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {product.sku}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="aspect-16/10 overflow-hidden rounded-lg border bg-muted">
                {primaryImage?.url ? (
                  <img
                    src={primaryImage.url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      No image available
                    </span>
                  </div>
                )}
              </div>
              {product.images && product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image) => (
                    <div
                      key={image.id}
                      className={`aspect-square overflow-hidden rounded-md border bg-muted ${
                        image.isPrimary
                          ? "border-2 border-primary"
                          : "border-border"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} image`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-[13px]">
              <DetailLabel>SKU</DetailLabel>
              <DetailValue className="font-mono text-xs">
                {product.sku}
              </DetailValue>

              <DetailLabel>Category</DetailLabel>
              <DetailValue>{product.category}</DetailValue>

              <DetailLabel>Price</DetailLabel>
              <DetailValue className="font-mono text-xs">
                ${product.price.toFixed(2)}
              </DetailValue>

              <DetailLabel>Stock</DetailLabel>
              <DetailValue className="font-mono text-xs">
                {product.stock}
              </DetailValue>

              <DetailLabel>Status</DetailLabel>
              <div>
                <Badge
                  variant="outline"
                  className={getStatusClassName(product.status)}
                >
                  {product.status}
                </Badge>
              </div>

              <DetailLabel>Description</DetailLabel>
              <DetailValue className="leading-relaxed">
                {product.description || "No description available."}
              </DetailValue>

              <DetailLabel>Created</DetailLabel>
              <DetailValue className="text-muted-foreground">
                {product.createdAt || "—"}
              </DetailValue>

              <DetailLabel>Updated</DetailLabel>
              <DetailValue className="text-muted-foreground">
                {product.updatedAt || "—"}
              </DetailValue>
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="border-t px-5 py-3">
          <div className="flex w-full justify-end gap-2">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>

            <Button onClick={() => onEdit?.(product)}>Edit</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
