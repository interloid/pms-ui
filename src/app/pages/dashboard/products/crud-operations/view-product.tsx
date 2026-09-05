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
import {
  formatDateTime,
  getStatusClassName,
  getStatusLabel,
} from "@/lib/converters";
import type { ProductViewProps } from "@/types/data-type";
import { DetailLabel, DetailValue } from "@/components/shad/detail-label";
import { ProductImagePreview } from "../preview-image/product-image-preview";
import { getPrimaryImage } from "@/lib/product-utils";

export function ProductView({
  product,
  open,
  onOpenChange,
  onEdit,
}: ProductViewProps) {
  if (!product) {
    return null;
  }

  const primaryImage = getPrimaryImage(product);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="gap-0 sm:max-w-xl!">
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
                    <ProductImagePreview
                      src={primaryImage.url}
                      alt={product.name}
                      className="h-full w-full"
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
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {product.images.map((image) => (
                      <div
                        key={image.id}
                        className={`group relative aspect-square overflow-hidden rounded-md border bg-muted ${
                          image.is_primary
                            ? "border-2 border-primary"
                            : "border-border"
                        }`}
                      >
                        <ProductImagePreview
                          src={image.url}
                          alt={`${product.name} image`}
                          className="h-full w-full"
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
                <DetailValue>{product.category_name}</DetailValue>

                <DetailLabel>Price</DetailLabel>
                <DetailValue className="font-mono text-xs">
                  ${Number(product.price).toFixed(2)}
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
                    {getStatusLabel(product.status)}
                  </Badge>
                </div>

                <DetailLabel>Description</DetailLabel>
                <DetailValue className="leading-relaxed">
                  {product.description || "No description available."}
                </DetailValue>

                <DetailLabel>Created</DetailLabel>
                <DetailValue className="text-muted-foreground">
                  {product.created_at
                    ? formatDateTime(product.created_at)
                    : "—"}
                </DetailValue>

                <DetailLabel>Updated</DetailLabel>
                <DetailValue className="text-muted-foreground">
                  {product.updated_at
                    ? formatDateTime(product.updated_at)
                    : "—"}
                </DetailValue>
              </div>
            </div>
          </div>

          <SheetFooter className="border-t px-5 py-3">
            <div className="flex w-full flex-row-reverse justify-start gap-2">
              <Button variant="default" onClick={() => onEdit?.(product)}>
                Edit
              </Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
