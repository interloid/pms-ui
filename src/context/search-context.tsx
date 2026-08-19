import { createContext, useContext } from "react";

type SearchContextValue = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export const SearchContext = createContext<SearchContextValue>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export function useSearch() {
  return useContext(SearchContext);
}
