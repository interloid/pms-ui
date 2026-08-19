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

const user = {
  name: "kavikarthik",
  email: "kavikarthik@interloid",
  avatar: "src/assets/test-avatar.jpg",
};

export default function DashboardLayout() {
  const [productCount, setProductCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getProducts()
      .then((products) => setProductCount(products.length))
      .catch(() => setProductCount(0));
  }, []);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
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