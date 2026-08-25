import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductFilters } from "@/app/pages/dashboard/products/product-filters";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearch } from "@/context/search-context";
import type {
  ApiProduct,
  ProductCategory,
  ProductStatusFilter,
} from "@/types/data-type";
import { ProductTable } from "./product-table";
import { ProductView } from "./crud-operations/view-product";
import { ProductEdit } from "./crud-operations/edit-product";
import {
  getProducts,
  deleteProduct as deleteProductApi,
} from "@/services/product-service";
import { ProductListSkeleton } from "@/components/shad/product-list-skeleton";

export default function Products() {
  const { searchQuery, refreshKey } = useSearch();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<ProductCategory>("All");
  const [status, setStatus] = useState<ProductStatusFilter>("All");
  const [priceRange, setPriceRange] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [productCount, setProductCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<ApiProduct | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const response = await getProducts({
          page,
          pageSize,
          status,
          category,
          search: searchQuery,
          priceRange,
          inStockOnly,
          sort: "price",
          order: sortOrder,
        });
        setProducts(response.products);
        setProductCount(response.total);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [
    page,
    pageSize,
    status,
    category,
    debouncedSearch,
    priceRange,
    inStockOnly,
    sortOrder,
    refreshKey,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  function updateCategory(value: ProductCategory) {
    setCategory(value);
    setPage(1);
  }

  function updateStatus(value: ProductStatusFilter) {
    setStatus(value);
    setPage(1);
  }

  function updatePrice(value: string) {
    setPriceRange(value);
    setPage(1);
  }

  function updateStock(value: boolean) {
    setInStockOnly(value);
    setPage(1);
  }

  function archiveProduct(id: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              status: "archived",
            }
          : product,
      ),
    );
    setArchiveId(null);
    toast.success("Product archived successfully");
  }

  async function handleDeleteProduct(id: string) {
    try {
      await deleteProductApi(id);
      setProducts((current) => current.filter((product) => product.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    }
  }

  function handleViewProduct(product: ApiProduct) {
    setViewProduct(product);
    setViewOpen(true);
  }

  function handleEditProduct(product: ApiProduct) {
    setViewOpen(false);
    setEditProduct(product);
    setEditOpen(true);
  }
  function handleProductUpdated(updatedProduct: ApiProduct) {
    setProducts((current) =>
      current.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product,
      ),
    );
    setViewProduct((current) =>
      current?.id === updatedProduct.id ? updatedProduct : current,
    );
    setEditProduct((current) =>
      current?.id === updatedProduct.id ? updatedProduct : current,
    );
  }
  if (isLoading) {
    return <ProductListSkeleton />;
  }

  return (
    <div className="w-full space-y-4">
      <div className="px-4 lg:px-6">
        <ProductFilters
          category={category}
          status={status}
          priceRange={priceRange}
          inStockOnly={inStockOnly}
          productCount={productCount}
          sortOrder={sortOrder}
          onCategoryChange={updateCategory}
          onStatusChange={updateStatus}
          onPriceChange={updatePrice}
          onStockChange={updateStock}
          onSortChange={() =>
          setSortOrder((current) => (current === "asc" ? "desc" : "asc"))
          }
        />
      </div>
      <ProductTable
        products={products}
        archiveId={archiveId}
        onView={handleViewProduct}
        onArchive={setArchiveId}
        onCancelArchive={() => setArchiveId(null)}
        onConfirmArchive={archiveProduct}
        onDelete={handleDeleteProduct}
      />
      <ProductView
        product={viewProduct}
        open={viewOpen}
        onOpenChange={setViewOpen}
        onEdit={handleEditProduct}
      />
      <ProductEdit
        product={editProduct}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={handleProductUpdated}
      />
      <div className="flex items-center justify-between px-4 pb-4 lg:px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-16.25 hover:bg-primary-hover hover:border-primary">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={String(size)} className="hover:bg-primary-hover! ">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {productCount === 0 ? 0 : (page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, productCount)} of {productCount}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8 hover:bg-primary-hover! hover:border-primary"
              disabled={page === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8 hover:bg-primary-hover! hover:border-primary"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8 hover:bg-primary-hover! hover:border-primary"
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8 hover:bg-primary-hover! hover:border-primary"
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
