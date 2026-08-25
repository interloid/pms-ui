import { AppSidebar } from "@/components/shad/app-sidebar";
import Header from "@/components/shad/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { SearchContext } from "@/context/search-context";
import { getProducts } from "@/services/product-service";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout() {
  const [productCount, setProductCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();
  const refresh = () => {
    setRefreshKey((current) => current + 1);
  };

  useEffect(() => {
    const loadProductCount = async () => {
      try {
        const response = await getProducts({
          page: 1,
          pageSize: 1,
          status: "All",
          category: "All",
          search: "",
          priceRange: "all",
          inStockOnly: false,
        });
        setProductCount(response.total);
      } catch {
        setProductCount(0);
      }
    };

    loadProductCount();
  }, [refreshKey]);

  return (
    <SearchContext.Provider
      value={{ searchQuery, setSearchQuery, refreshKey, refresh }}
    >
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <Header user={user} productCount={productCount} />
          <main className="flex flex-1 flex-col p-4">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SearchContext.Provider>
  );
}
