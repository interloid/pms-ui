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

export type ProductStatus =
  | "Active"
  | "Draft"
  | "Out of Stock"
  | "Archived";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  updatedAt: string;
  image?: string;
}

export type ProductCategory =
  | "All"
  | "Lighting"
  | "Apparel"
  | "Home"
  | "Electronics"
  | "Outdoor"
  | "Stationery";

export type ProductStatusFilter =
  | "All"
  | ProductStatus;

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