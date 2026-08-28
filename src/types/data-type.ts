import type { LucideIcon } from "lucide-react";
import type { AuthUser } from "./auth";

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
  category_name: ProductCategory;
  price: string | number;
  stock: number;
  status: ProductStatus;
  description: string;
  created_at: string;
  updated_at: string;
  images: ApiProductImage[];
};

export type Pagination = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type GetProductsResponse = {
  success: boolean;
  message: string;
  data: ApiProduct[];
  pagination: Pagination;
};
export type ProductsResult = {
  products: ApiProduct[];
  total: number;
  totalPages: number;
};

export type GetProductsParams = {
  page: number;
  pageSize: number;
  status?: ProductStatusFilter;
  category?: ProductCategory;
  search?: string;
  priceRange?: string;
  sort?: ProductSortField;
  order?: SortOrder;
};
export type ProductCategory =
  | "All"
  | "Lighting"
  | "Apparel"
  | "Home"
  | "Electronics"
  | "Outdoor"
  | "Stationery";

export const categories: Array<{
  value: ProductCategory;
  label: string;
}> = [
  { value: "All", label: "All" },
  { value: "Lighting", label: "Lighting" },
  { value: "Apparel", label: "Apparel" },
  { value: "Home", label: "Home" },
  { value: "Electronics", label: "Electronics" },
  { value: "Outdoor", label: "Outdoor" },
  { value: "Stationery", label: "Stationery" },
];

export type ProductStatus = "active" | "draft" | "out_of_stock" | "archived";

export const statuses: Array<{
  value: ProductStatus;
  label: string;
}> = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "archived", label: "Archived" },
];

export const statusFilters: Array<{
  value: ProductStatusFilter;
  label: string;
}> = [{ value: "All", label: "All" }, ...statuses];

export interface ProductImage {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
}

export interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export interface ProductTableRowProps {
  product: ApiProduct;
  isArchiving: boolean;
  isDeleting: boolean;
  onView: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onCancelArchive: () => void;
  onConfirmArchive: () => void;
  onDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

export type ProductTableProps = {
  products: ApiProduct[];
  archiveId: string | null;
  deleteId: string | null;
  sort: ProductSort;
  onSort: (field: ProductSortField) => void;
  onView: (product: ApiProduct) => void;
  onArchive: (id: string) => void;
  onCancelArchive: () => void;
  onConfirmArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
  onEdit: (product: ApiProduct) => void;
};

export type ProductStatusFilter = "All" | ProductStatus;

export type ProductFiltersProps = {
  category: ProductCategory;
  status: ProductStatusFilter;
  priceRange: string;
  productCount: number;
  onCategoryChange: (value: ProductCategory) => void;
  onStatusChange: (value: ProductStatusFilter) => void;
  onPriceChange: (value: string) => void;
  onReset: () => void;
};

export type ProductViewProps = {
  product: ApiProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: ApiProduct) => void;
};

export type ImageError = {
  fileName?: string;
  message: string;
  details?: string;
};

export type ProductEditProps = {
  product: ApiProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (product: ApiProduct) => void;
};

export type ProductForm = {
  name: string;
  sku: string;
  category: ProductCategory;
  price: string;
  stock: string;
  status: ProductStatus;
  description: string;
};

export type AddProductsProps = {
  onProductCreated?: () => void;
};

export type User = {
  name: string;
  avatar?: string;
};

export type HeaderProps = {
  user: AuthUser | null;
  productCount?: number;
};

export type InputInlineProps = {
  user: AuthUser | null;
};
export type SearchContextValue = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshKey: number;
  refresh: () => void;
};

export type FormErrors = {
  name?: string;
  sku?: string;
  category?: string;
  price?: string;
  stock?: string;
};

export type FormError = Partial<Record<keyof ProductForm, string>>;

export type JsonBody = Record<string, unknown>;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | JsonBody;
};

export type ProductSortField =
  "sku" | "name" | "category" | "price" | "stock" | "status" | "updated";

export type SortOrder = "asc" | "desc";

export type ProductSort = {
  field: ProductSortField;
  order: SortOrder;
};

export type Props = ProductTableProps & {
  sort: ProductSort;
  onSort: (field: ProductSortField) => void;
};

export type SortableTableHeadProps = {
  label: string;
  field: ProductSortField;
  sort: ProductSort;
  onSort: (field: ProductSortField) => void;
  className?: string;
};

export type PaginationProps = {
  page: number;
  pageSize: number;
  productCount: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
};


export type ImagePreviewDialogProps = {
  image: {
    src: string;
    alt: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};