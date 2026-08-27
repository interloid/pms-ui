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
  archiveProduct as archiveProductApi,
} from "@/services/product-service";
import { ProductListSkeleton } from "@/components/shad/product-list-skeleton";

export default function ProductsPage() {
  const { searchQuery, refreshKey, refresh } = useSearch();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<ProductCategory>("All");
  const [status, setStatus] = useState<ProductStatusFilter>("All");
  const [priceRange, setPriceRange] = useState("all");
  const [productCount, setProductCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<ApiProduct | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [sort, setSort] = useState<"price" | "updated">("updated");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const response = await getProducts({
          page,
          pageSize,
          status,
          category,
          search: debouncedSearch,
          priceRange,
          sort,
          order,
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
    refreshKey,
    sort,
    order,
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

  function updateSort(
    nextSort: "price" | "updated",
    nextOrder: "asc" | "desc",
  ) {
    setSort(nextSort);
    setOrder(nextOrder);
    setPage(1);
  }

  function resetFilters() {
    setCategory("All");
    setStatus("All");
    setPriceRange("all");
    setSort("updated");
    setOrder("desc");
    setPage(1);
  }

  async function handleDeleteProduct(id: string) {
    try {
      await deleteProductApi(id);
      setDeleteId(null);
      setProducts((current) => current.filter((product) => product.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    }
  }

  async function handleArchiveProduct(id: string) {
    try {
      await archiveProductApi(id);
      setArchiveId(null);
      toast.success("Product archived successfully");
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to archive product",
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
      <ProductFilters
        category={category}
        status={status}
        priceRange={priceRange}
        productCount={productCount}
        sort={sort}
        order={order}
        onCategoryChange={updateCategory}
        onStatusChange={updateStatus}
        onPriceChange={updatePrice}
        onSortChange={updateSort}
        onReset={resetFilters}
      />
      <ProductTable
        products={products}
        archiveId={archiveId}
        deleteId={deleteId}
        onView={handleViewProduct}
        onArchive={setArchiveId}
        onCancelArchive={() => setArchiveId(null)}
        onConfirmArchive={handleArchiveProduct}
        onDelete={setDeleteId}
        onCancelDelete={() => setDeleteId(null)}
        onConfirmDelete={handleDeleteProduct}
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
      <div className="flex flex-col gap-3 px-3 pb-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-16.25 hover:bg-primary-hover hover:border-primary focus-visible:border-primary! focus-visible:primary-3! focus-visible:ring-primary/20!">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className="hover:bg-primary-hover!"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
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
