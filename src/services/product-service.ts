import { apiRequest } from "@/lib/api";
import {
  convertKeysToCamelCase,
  convertKeysToSnakeCase,
  priceToNumber,
  priceToString,
  formatStatus,
  statusToApi,
} from "@/lib/converters";

import type {
  ApiProduct,
  GetProductsResponse,
  Product,
  ProductCategory,
  ProductStatus,
} from "@/types/data-type";

export async function getProducts(pageSize: Number): Promise<Product[]> {
  const response = await apiRequest<GetProductsResponse>(
    `/api/v1/products?sort=updated&order=desc&page=1&page_size=${pageSize}`
  );
  return response.data.map((item) => convertKeysToCamelCase(item) as Product);
}

export async function createProduct(product: Product): Promise<Product> {
  const apiData = {
    ...convertKeysToSnakeCase(product),
    price: priceToString(product.price),
    status: statusToApi(product.status),
  };
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: ApiProduct;
  }>("/api/v1/products", {
    method: "POST",
    body: apiData,
  });
  return convertKeysToCamelCase(response.data) as Product;
}

export async function updateProduct(
  id: string,
  product: Product
): Promise<Product> {
  const apiData = {
    ...convertKeysToSnakeCase(product),
    price: priceToString(product.price),
    status: statusToApi(product.status),
  };
  const response = await apiRequest<{
    success: boolean;
    message: string;
    data: ApiProduct;
  }>(`/api/v1/products/${id}`, {
    method: "PUT",
    body: apiData,
  });
  return convertKeysToCamelCase(response.data) as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest(`/api/v1/products/${id}`, {
    method: "DELETE",
  });
}