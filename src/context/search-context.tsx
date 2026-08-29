import type { SearchContextValue, SearchProviderProps } from "@/types/data-type";
import {
    createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export const SearchContext = createContext<SearchContextValue | undefined>(
  undefined,
);

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [productCount, setProductCount] = useState(0);
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
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
