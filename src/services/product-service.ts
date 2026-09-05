import { apiRequest } from "@/lib/api";
import type {
  ApiProduct,
  GetProductsParams,
  GetProductsResponse,
  ProductsResult,
} from "@/types/data-type";

export async function getProducts({
  page,
  pageSize,
  status = "All",
  category = "All",
  search = "",
  priceRange = "all",
}: GetProductsParams): Promise<ProductsResult> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  if (status !== "All") {
    params.set("status", status);
  }

  if (category !== "All") {
    params.set("category_name", category);
  }

  const trimmedSearch = search.trim();

  if (trimmedSearch) {
    params.set("search", trimmedSearch);
  }

  if (priceRange !== "all") {
    const [minPrice, maxPrice] = priceRange.split("-");

    if (minPrice) {
      params.set("min_price", minPrice);
    }
    if (maxPrice) {
      params.set("max_price", maxPrice);
    }
  }
  const response = await apiRequest<GetProductsResponse>(
    `/api/v1/products?${params.toString()}`,
  );

  return {
    products: response.data,
    total: response.pagination.total,
    totalPages: response.pagination.total_pages,
  };
}

export async function createProduct(formData: FormData): Promise<ApiProduct> {
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: ApiProduct;
  }>("/api/v1/products", {
    method: "POST",
    body: formData,
  });
  return response.data;
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ApiProduct> {
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: ApiProduct;
  }>(`/api/v1/products/${id}`, {
    method: "PATCH",
    body: formData,
  });

  return response.data;
}

export async function archiveProduct(id: string): Promise<ApiProduct> {
  const formData = new FormData();
  formData.append("status", "archived");
  formData.append("removed_image_ids", JSON.stringify([]));
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: ApiProduct;
  }>(`/api/v1/products/${id}`, {
    method: "PATCH",
    body: formData,
  });

  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest(`/api/v1/products/${id}`, {
    method: "DELETE",
  });
}
