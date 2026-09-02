import type { ApiProduct, ApiProductImage } from "@/types/data-type";

export function getPrimaryImage(
  product: ApiProduct,
): ApiProductImage | undefined {
  return (
    product.images?.find((image) => image.is_primary) ?? product.images?.[0]
  );
}
