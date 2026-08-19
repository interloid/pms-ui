import { apiRequest } from "@/lib/api";
import type {
  ApiProduct,
  GetProductsResponse,
  ProductsResult,
} from "@/types/data-type";

export async function getProducts(
  page: number,
  pageSize: number,
): Promise<ProductsResult> {
  const response = await apiRequest<GetProductsResponse>(
    `/api/v1/products?sort=updated&order=desc&page=${page}&page_size=${pageSize}`,
  );
  return {
    products: response.data,
    total: response.pagination.total,
    totalPages: response.pagination.total_pages,
  };
}

export async function createProduct(
  product: Omit<ApiProduct, "id">,
): Promise<ApiProduct> {
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: ApiProduct;
  }>("/api/v1/products", {
    method: "POST",
    body: product,
  });
  return response.data;
}

export async function updateProduct(
  id: string,
  product: Omit<ApiProduct, "id">,
): Promise<ApiProduct> {
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: ApiProduct;
  }>(`/api/v1/products/${id}`, {
    method: "PATCH",
    body: product,
  });

  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest(`/api/v1/products/${id}`, {
    method: "DELETE",
  });
}
