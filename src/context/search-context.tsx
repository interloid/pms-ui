import type { SearchContextValue } from "@/types/data-type";
import { createContext, useContext } from "react";

export const SearchContext = createContext<SearchContextValue>({
  searchQuery: "",
  setSearchQuery: () => {},
  refreshKey: 0,
  refresh: () => {},
});

export function useSearch() {
  return useContext(SearchContext);
}
