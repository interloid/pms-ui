import { AppSidebar } from "@/components/shad/app-sidebar";
import Header from "@/components/shad/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useCallback, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { SearchContext } from "@/context/search";
import { useAuth } from "@/hooks/useAuth";
import { AppFooter } from "@/components/shad/app-footer";

export default function DashboardLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [productCount, setProductCount] = useState(0);

  const { user } = useAuth();

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      refreshKey,
      refresh,
      productCount,
      setProductCount,
    }),
    [searchQuery, refreshKey, refresh, productCount],
  );

  return (
    <SearchContext.Provider value={value}>
      <SidebarProvider>
        <AppSidebar user={user} />

        <SidebarInset>
          <Header user={user} productCount={productCount} />
          <main className="flex flex-1 flex-col justify-between p-3 sm:p-4">
            <Outlet />
          </main>
          <AppFooter />
        </SidebarInset>
      </SidebarProvider>
    </SearchContext.Provider>
  );
}
