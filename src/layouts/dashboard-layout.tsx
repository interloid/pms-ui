import { AppSidebar } from "@/components/shad/app-sidebar";
import Header from "@/components/shad/header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
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

  useEffect(() => {
    getProducts(1, 1)
      .then((response) => setProductCount(response.total))
      .catch(() => setProductCount(0));
  }, [refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, refreshKey, refresh }}>
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