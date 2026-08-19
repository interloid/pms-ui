import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { priceToNumber, formatStatus } from "@/lib/converters";
import type {
  ApiProduct,
  ProductCategory,
  ProductStatusFilter,
} from "@/types/data-type";
import { ProductTable } from "./product-table";
import { ProductView } from "./crud-operations/view-product";
import { getProducts, deleteProduct as deleteProductApi } from "@/services/product-service";
import { Spinner } from "@/components/ui/spinner";

export default function Products() {
  const { searchQuery, refreshKey } = useSearch();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [category, setCategory] = useState<ProductCategory>("All");
  const [status, setStatus] = useState<ProductStatusFilter>("All");
  const [priceRange, setPriceRange] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortDescending, setSortDescending] = useState(true);
  const [productCount, setProductCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<ApiProduct | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const response = await getProducts(page, pageSize);
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
  }, [page, pageSize, refreshKey]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query),
      );
    }

    if (category !== "All") {
      result = result.filter((product) => product.category_name === category);
    }
    if (status !== "All") {
      result = result.filter(
        (product) => formatStatus(product.status) === status,
      );
    }

    if (inStockOnly) {
      result = result.filter((product) => product.stock > 0);
    }

    if (priceRange !== "all") {
      const [minimumPrice, maximumPrice] = priceRange.split("-").map(Number);

      result = result.filter((product) => {
        const price = priceToNumber(product.price);

        return price >= minimumPrice && price <= maximumPrice;
      });
    }

    result.sort((a, b) =>
      sortDescending
        ? priceToNumber(b.price) - priceToNumber(a.price)
        : priceToNumber(a.price) - priceToNumber(b.price),
    );

    return result;
  }, [
    products,
    searchQuery,
    category,
    status,
    priceRange,
    inStockOnly,
    sortDescending,
  ]);

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Spinner/>
        <p className="text-sm text-muted-foreground">Loading products...</p>
      </div>
    );
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
          sortDescending={sortDescending}
          onCategoryChange={updateCategory}
          onStatusChange={updateStatus}
          onPriceChange={updatePrice}
          onStockChange={updateStock}
          onSortChange={() => setSortDescending((current) => !current)}
        />
      </div>
      <ProductTable
        products={filteredProducts}
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
            <SelectTrigger className="h-8 w-16.25">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
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
              className="size-8"
              disabled={page === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8"
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
