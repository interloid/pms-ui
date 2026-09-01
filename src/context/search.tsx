import type { SearchContextValue } from "@/types/data-type";
import { createContext } from "react";

export const SearchContext = createContext<SearchContextValue | undefined>(
  undefined,
);




