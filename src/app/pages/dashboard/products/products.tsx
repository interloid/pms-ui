import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductFilters } from "@/app/pages/dashboard/products/product-filters";
import { useSearch } from "@/context/search-context";
import type {
  ApiProduct,
  ProductCategory,
  ProductSort,
  ProductSortField,
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
import { TablePagination } from "@/components/shad/table-pagination";

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
  const [sort, setSort] = useState<ProductSort>({
    field: "updated",
    order: "desc",
  });
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
          sort: sort.field,
          order: sort.order,
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
    sort.field,
    sort.order,
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

  const handleSort = (field: ProductSortField) => {
    setSort((current) => ({
      field,
      order:
        current.field === field && current.order === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

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
