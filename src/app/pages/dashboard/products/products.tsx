import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductFilters } from "@/app/pages/dashboard/products/product-filters";
import { ProductForm } from "./Product-form";
import { ProductTable } from "./product-table";
import { useSearch } from "@/context/search-context";
import {
  archiveProduct as archiveProductApi,
  deleteProduct as deleteProductApi,
  getProducts,
} from "@/services/product-service";
import type {
  ApiProduct,
  ProductCategoryFilter,
  ProductMode,
  ProductSort,
  ProductSortField,
  ProductStatusFilter,
} from "@/types/data-type";
import { ProductListSkeleton } from "@/components/shad/product-list-skeleton";
import { TablePagination } from "@/components/shad/table-pagination";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const { searchQuery, refreshKey, refresh, productCount, setProductCount } =
    useSearch();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [category, setCategory] = useState<ProductCategoryFilter>("All");
  const [status, setStatus] = useState<ProductStatusFilter>("All");
  const [priceRange, setPriceRange] = useState("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const [sort, setSort] = useState<ProductSort>({
    field: "updated",
    order: "desc",
  });
  const [formProduct, setFormProduct] = useState<ApiProduct | null>(null);
  const [formMode, setFormMode] = useState<ProductMode>("add");
  const [formOpen, setFormOpen] = useState(false);
  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await getProducts({
          page,
          pageSize,
          status,
          category,
          search: debouncedSearch,
          priceRange,
          sort: sort.field,
          order: sort.order,
        });

        if (ignore) return;

        setProducts(response.products);
        setProductCount(response.total);
        setTotalPages(response.totalPages);
      } catch (error) {
        if (!ignore) {
          setLoadError(
            error instanceof Error ? error.message : "Failed to load products",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setHasLoadedOnce(true);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [
    page,
    pageSize,
    status,
    category,
    debouncedSearch,
    priceRange,
    refreshKey,
    sort.field,
    sort.order,
    setProductCount,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  function updateCategory(value: ProductCategoryFilter) {
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

  function resetFilters() {
    setCategory("All");
    setStatus("All");
    setPriceRange("all");
    setSort({
      field: "updated",
      order: "desc",
    });
    setPage(1);
  }

  function handleSort(field: ProductSortField) {
    setSort((current) => ({
      field,
      order:
        current.field === field && current.order === "asc" ? "desc" : "asc",
    }));

    setPage(1);
  }

  async function handleDeleteProduct(id: string) {
    try {
      await deleteProductApi(id);

      setDeleteId(null);

      toast.success("Product deleted successfully");

      refresh();
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
    setFormMode("view");
    setFormProduct(product);
    setFormOpen(true);
  }

  function handleEditProduct(product: ApiProduct) {
    setFormMode("edit");
    setFormProduct(product);
    setFormOpen(true);
  }

  function handleProductUpdated(updatedProduct: ApiProduct) {
    setProducts((current) =>
      current.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product,
      ),
    );

    setFormProduct((current) =>
      current?.id === updatedProduct.id ? updatedProduct : current,
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-50 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Button type="button" variant="outline" onClick={refresh}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-4">
        <ProductFilters
          category={category}
          status={status}
          priceRange={priceRange}
          productCount={productCount}
          onCategoryChange={updateCategory}
          onStatusChange={updateStatus}
          onPriceChange={updatePrice}
          onReset={resetFilters}
        />
        {!hasLoadedOnce ? (
          <ProductListSkeleton />
        ) : (
          <div
            className={
              isLoading
                ? "opacity-60 transition-opacity duration-200"
                : "transition-opacity duration-200"
            }
          >
            <ProductTable
              products={products}
              archiveId={archiveId}
              deleteId={deleteId}
              sort={sort}
              onSort={handleSort}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onArchive={setArchiveId}
              onCancelArchive={() => setArchiveId(null)}
              onConfirmArchive={handleArchiveProduct}
              onDelete={setDeleteId}
              onCancelDelete={() => setDeleteId(null)}
              onConfirmDelete={handleDeleteProduct}
            />
          </div>
        )}

        <ProductForm
          mode={formMode}
          product={formProduct}
          open={formOpen}
          onOpenChange={setFormOpen}
          onEdit={handleEditProduct}
          onProductUpdated={handleProductUpdated}
          onProductCreated={() => refresh()}
        />
      </div>
      <TablePagination
        page={page}
        pageSize={pageSize}
        productCount={productCount}
        totalPages={totalPages}
        setPage={setPage}
        setPageSize={setPageSize}
      />
    </>
  );
}
