import type { LucideIcon } from "lucide-react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import type { AuthUser } from "./auth";

type NavItem = {
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

export type ProductCategory =
  | "Lighting"
  | "Apparel"
  | "Home"
  | "Electronics"
  | "Outdoor"
  | "Stationery";

export type ProductCategoryFilter = "All" | ProductCategory;

export type ProductStatus = "active" | "draft" | "out_of_stock" | "archived";

export type ProductStatusFilter = "All" | ProductStatus;

export type ProductSortField =
  | "sku"
  | "name"
  | "category"
  | "price"
  | "stock"
  | "status"
  | "updated";

export type SortOrder = "asc" | "desc";

export type ProductSort = {
  field: ProductSortField;
  order: SortOrder;
};

export const categories: Array<{
  value: ProductCategoryFilter;
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

export const productCategories = categories.filter(
  (category) => category.value !== "All",
);

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
  category?: ProductCategoryFilter;
  search?: string;
  priceRange?: string;
  sort?: ProductSortField;
  order?: SortOrder;
};

export type ProductForm = {
  name: string;
  sku: string;
  category: ProductCategory | "";
  price: string;
  stock: string;
  status: ProductStatus;
  description: string;
};

export type FormError = Partial<Record<keyof ProductForm, string>>;

export interface ProductImage {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
}

export type ProductImageProps = {
  src?: string;
  alt: string;
  className?: string;
};

export type ProductImagePreviewProps = {
  src: string;
  alt: string;
  className?: string;
};

export type ImagePreviewDialogProps = {
  image: {
    src: string;
    alt: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type ImageError = {
  fileName?: string;
  message: string;
  details?: string;
};

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
  onEdit: (product: ApiProduct) => void;
  onArchive: (id: string) => void;
  onCancelArchive: () => void;
  onConfirmArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
};

export type ProductFiltersProps = {
  category: ProductCategoryFilter;
  status: ProductStatusFilter;
  priceRange: string;
  productCount: number;
  onCategoryChange: (value: ProductCategoryFilter) => void;
  onStatusChange: (value: ProductStatusFilter) => void;
  onPriceChange: (value: string) => void;
  onReset: () => void;
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

export interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;

  refreshKey: number;
  refresh: () => void;

  productCount: number;
  setProductCount: React.Dispatch<React.SetStateAction<number>>;
}

export interface SearchProviderProps {
  children: ReactNode;
}

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

export type HeaderActionsProps = InputInlineProps;

export type JsonBody = object;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | JsonBody;
};

export type ProductMode = "add" | "view" | "edit";

export type AddProductsProps = {
  onProductCreated?: () => void;
};

export type ProductEditProps = {
  product: ApiProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (product: ApiProduct) => void;
};

export type ProductViewProps = {
  product: ApiProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: ApiProduct) => void;
};

export type ProductFormProps = {
  mode: ProductMode;
  product?: ApiProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: ApiProduct) => void;
  onProductCreated?: () => void;
  onProductUpdated?: (product: ApiProduct) => void;
  trigger?: React.ReactNode;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string;
      details?: unknown;
      requestId?: string;
    },
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = options?.code;
    this.details = options?.details;
    this.requestId = options?.requestId;
  }
}
export interface ProductFormFieldsProps {
  form: ProductForm;
  errors: FormError;
  mode: ProductMode;
  onChange: <K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) => void;
}

export interface ProductFormImagesProps {
  mode: ProductMode;

  existingImages: ApiProductImage[];
  newImages: ProductImage[];
  removedImageIds: Set<string>;

  remainingSlots: number;
  imageError: ImageError | null;
  isDragging: boolean;
  isSubmitting: boolean;

  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDragEnter: (event: DragEvent<HTMLLabelElement>) => void;
  onDragOver: (event: DragEvent<HTMLLabelElement>) => void;
  onDragLeave: (event: DragEvent<HTMLLabelElement>) => void;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;

  onRemoveExisting: (id: string) => void;
  onRemoveNew: (id: string) => void;

  onSetExistingPrimary: (id: string) => void;
  onSetNewPrimary: (id: string) => void;
}

export interface ProductImageCardProps {
  src: string;
  alt: string;
  isPrimary: boolean;
  onRemove: () => void;
  onSetPrimary?: () => void;
}

export interface ProductFormFooterProps {
  isSubmitting: boolean;
  isAddMode: boolean;
  onCancel: () => void;
}

