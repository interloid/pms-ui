import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductFilters } from "@/app/pages/dashboard/products/product-filters";
import { ProductTable } from "@/app/pages/dashboard/products/product-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  Product,
  ProductCategory,
  ProductStatusFilter,
} from "@/types/data-type";

const initialProducts: Product[] = [
  {
    id: "1",
    sku: "MRD-LAMP-OAK",
    name: "Meridian Desk Lamp",
    category: "Lighting",
    price: 89,
    stock: 34,
    status: "Active",
    updatedAt: "2 min ago",
  },
  {
    id: "2",
    sku: "ACM-TSHIRT-BLK-M",
    name: "Acme Cotton T-Shirt",
    category: "Apparel",
    price: 19.99,
    stock: 120,
    status: "Active",
    updatedAt: "8 Aug",
  },
  {
    id: "3",
    sku: "NDL-MUG-CER-350",
    name: "Nordic Ceramic Mug 350ml",
    category: "Home",
    price: 14.5,
    stock: 0,
    status: "Out of Stock",
    updatedAt: "6 Aug",
  },
  {
    id: "4",
    sku: "NWT-TOTE-CANVAS",
    name: "Northwind Canvas Tote",
    category: "Apparel",
    price: 29,
    stock: 42,
    status: "Active",
    updatedAt: "5 Aug",
  },
  {
    id: "5",
    sku: "HLX-KEYB-65-WHT",
    name: "Helix 65% Keyboard",
    category: "Electronics",
    price: 129,
    stock: 12,
    status: "Draft",
    updatedAt: "3 Aug",
  },
  {
    id: "6",
    sku: "GRV-BOTTLE-750",
    name: "Grove Insulated Bottle 750ml",
    category: "Outdoor",
    price: 32,
    stock: 208,
    status: "Active",
    updatedAt: "1 Aug",
  },
  {
    id: "7",
    sku: "PLM-NOTE-A5-GRD",
    name: "Palmer A5 Grid Notebook",
    category: "Stationery",
    price: 9.75,
    stock: 64,
    status: "Archived",
    updatedAt: "28 Jul",
  },
  {
    id: "8",
    sku: "ORB-MOUSE-WLS",
    name: "Orbit Wireless Mouse",
    category: "Electronics",
    price: 49.99,
    stock: 28,
    status: "Active",
    updatedAt: "26 Jul",
  },
  {
    id: "9",
    sku: "VTR-JACKET-NVY-L",
    name: "Venture Lightweight Jacket",
    category: "Apparel",
    price: 79,
    stock: 18,
    status: "Draft",
    updatedAt: "24 Jul",
  },
  {
    id: "10",
    sku: "ARC-PLANT-POT-M",
    name: "Arc Ceramic Plant Pot",
    category: "Home",
    price: 24,
    stock: 0,
    status: "Out of Stock",
    updatedAt: "22 Jul",
  },
  {
    id: "11",
    sku: "SOL-DESK-ORG",
    name: "Solstice Desk Organizer",
    category: "Stationery",
    price: 18.5,
    stock: 51,
    status: "Active",
    updatedAt: "20 Jul",
  },
  {
    id: "12",
    sku: "TRK-BAG-URB",
    name: "Track Urban Backpack",
    category: "Outdoor",
    price: 69,
    stock: 31,
    status: "Active",
    updatedAt: "18 Jul",
  },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [category, setCategory] = useState<ProductCategory>("All");
  const [status, setStatus] = useState<ProductStatusFilter>("All");
  const [priceRange, setPriceRange] = useState("0-500");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortDescending, setSortDescending] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== "All") {
      result = result.filter((product) => product.category === category);
    }
    if (status !== "All") {
      result = result.filter((product) => product.status === status);
    }
    if (inStockOnly) {
      result = result.filter((product) => product.stock > 0);
    }

    const [minimumPrice, maximumPrice] = priceRange.split("-").map(Number);

    result = result.filter(
      (product) =>
        product.price >= minimumPrice && product.price <= maximumPrice,
    );

    return result;
  }, [products, category, status, priceRange, inStockOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const start =
    filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, filteredProducts.length);

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
              status: "Archived",
            }
          : product,
      ),
    );
    setArchiveId(null);
    toast.success("Product archived successfully");
  }

  function deleteProduct(id: string) {
    setProducts((current) => current.filter((product) => product.id !== id));
    toast.success("Product deleted successfully");
  }

  return (
    <div className="w-full space-y-4">
      <div className="px-4 lg:px-6">
        <ProductFilters
          category={category}
          status={status}
          priceRange={priceRange}
          inStockOnly={inStockOnly}
          productCount={filteredProducts.length}
          sortDescending={sortDescending}
          onCategoryChange={updateCategory}
          onStatusChange={updateStatus}
          onPriceChange={updatePrice}
          onStockChange={updateStock}
          onSortChange={() => setSortDescending((current) => !current)}
        />
      </div>
      <div className="px-4 lg:px-6">
        <ProductTable
          products={paginatedProducts}
          archiveId={archiveId}
          onView={setSelectedProduct}
          onArchive={setArchiveId}
          onCancelArchive={() => setArchiveId(null)}
          onConfirmArchive={archiveProduct}
          onDelete={deleteProduct}
        />
      </div>
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
            {start}-{end} of {filteredProducts.length}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage === totalPages}
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
