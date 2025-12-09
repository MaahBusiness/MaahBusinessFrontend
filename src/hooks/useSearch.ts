import { useState, useMemo, useCallback } from "react";

interface UseSearchReturn<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredItems: T[];
  clearSearch: () => void;
  hasResults: boolean;
  resultCount: number;
}

export function useSearch<T extends Record<string, unknown>>(
  items: T[] = [],
  searchFields: string[] = []
): UseSearchReturn<T> {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return items.filter((item) => {
      return searchFields.some((field) => {
        // Handle nested fields (e.g., "product.name")
        const value = field.split(".").reduce<unknown>((obj, key) => {
          if (obj && typeof obj === "object") {
            return (obj as Record<string, unknown>)[key];
          }
          return undefined;
        }, item);

        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerSearchTerm);
      });
    });
  }, [items, searchTerm, searchFields]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
    clearSearch,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length,
  };
}

interface UseDateFilterReturn<T> {
  filterDate: string;
  setFilterDate: (date: string) => void;
  filteredItems: T[];
  clearDateFilter: () => void;
  hasDateFilter: boolean;
}

export function useDateFilter<T extends Record<string, unknown>>(
  items: T[] = [],
  dateField = "created_at"
): UseDateFilterReturn<T> {
  const [filterDate, setFilterDate] = useState("");

  const filteredItems = useMemo(() => {
    if (!filterDate) return items;

    return items.filter((item) => {
      const itemDate = item[dateField];
      if (!itemDate) return false;
      return new Date(itemDate as string).toISOString().split("T")[0] === filterDate;
    });
  }, [items, filterDate, dateField]);

  const clearDateFilter = useCallback(() => {
    setFilterDate("");
  }, []);

  return {
    filterDate,
    setFilterDate,
    filteredItems,
    clearDateFilter,
    hasDateFilter: !!filterDate,
  };
}

interface UseSearchAndFilterReturn<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterDate: string;
  setFilterDate: (date: string) => void;
  filteredItems: T[];
  clearFilters: () => void;
  hasFilters: boolean;
  resultCount: number;
}

export function useSearchAndFilter<T extends Record<string, unknown>>(
  items: T[] = [],
  searchFields: string[] = [],
  dateField = "created_at"
): UseSearchAndFilterReturn<T> {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const filteredItems = useMemo(() => {
    let result = items;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return searchFields.some((field) => {
          const value = field.split(".").reduce<unknown>((obj, key) => {
            if (obj && typeof obj === "object") {
              return (obj as Record<string, unknown>)[key];
            }
            return undefined;
          }, item);
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(lowerSearchTerm);
        });
      });
    }

    // Apply date filter
    if (filterDate) {
      result = result.filter((item) => {
        const itemDate = item[dateField];
        if (!itemDate) return false;
        return new Date(itemDate as string).toISOString().split("T")[0] === filterDate;
      });
    }

    return result;
  }, [items, searchTerm, filterDate, searchFields, dateField]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterDate("");
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filterDate,
    setFilterDate,
    filteredItems,
    clearFilters,
    hasFilters: !!searchTerm.trim() || !!filterDate,
    resultCount: filteredItems.length,
  };
}

export default useSearch;
