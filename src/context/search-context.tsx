import { createContext, useContext } from "react";

type SearchContextValue = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refreshKey: number;
  refresh: () => void;
};

export const SearchContext = createContext<SearchContextValue>({
  searchQuery: "",
  setSearchQuery: () => {},
  refreshKey: 0,
  refresh: () => {},
});

export function useSearch() {
  return useContext(SearchContext);
}
