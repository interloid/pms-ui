import { useCallback, useState } from "react";

import type { SearchProviderProps } from "@/types/data-type";

import { SearchContext } from "./search";

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [productCount, setProductCount] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const value = {
    searchQuery,
    setSearchQuery,
    refreshKey,
    refresh,
    productCount,
    setProductCount,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
