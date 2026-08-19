import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type NavMainProps = {
  items: NavItem[];
};

export type EmptyPageProps = {
  title?: string;
  description?: string;
};

export type ApiProductImage = {
  id: string;
  url: string;
  is_primary: boolean;
};

export type ApiProduct = {
  id: string;
  name: string;
  sku: string;
  category_name: string;
  price: string | number;
  stock: number;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
  images: ApiProductImage[];
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  status: ProductStatus;
  description?: string | null;
  images: ProductImageResponse[];
  createdAt: string;
  updatedAt: string;
};

export type GetProductsResponse = {
  success: boolean;
  message: string;
  data: ApiProduct[];
};

export type GetProductsParams = {
  page: number;
  pageSize: number;
};

export type ProductStatus = "Active" | "Draft" | "Out of Stock" | "Archived";

export type ProductCategory =
  | "All"
  | "Lighting"
  | "Apparel"
  | "Home"
  | "Electronics"
  | "Outdoor"
  | "Stationery";

export const categories: ProductCategory[] = [
  "All",
  "Lighting",
  "Apparel",
  "Home",
  "Electronics",
  "Outdoor",
  "Stationery",
];


export interface ProductImage {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
}

export interface ProductImageResponse {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface ProductTableRowProps {
  product: Product;
  isArchiving: boolean;
  onView: () => void;
  onArchive: () => void;
  onCancelArchive: () => void;
  onConfirmArchive: () => void;
  onDelete: () => void;
}

export interface ProductTableProps {
  archiveId: string | null;
  onView: (product: Product) => void;
  onArchive: (id: string) => void;
  onCancelArchive: () => void;
  onConfirmArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export type ProductStatusFilter = "All" | ProductStatus;

export interface ProductFiltersProps {
  category: ProductCategory;
  status: ProductStatusFilter;
  priceRange: string;
  inStockOnly: boolean;
  productCount: number;
  sortDescending: boolean;
  onCategoryChange: (value: ProductCategory) => void;
  onStatusChange: (value: ProductStatusFilter) => void;
  onPriceChange: (value: string) => void;
  onStockChange: (value: boolean) => void;
  onSortChange: () => void;
}

export type ImageError = {
  fileName?: string;
  message: string;
  details?: string;
};

