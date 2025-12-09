import { useState, useCallback, useMemo } from "react";

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  currentItems: T[];
  totalItems: number;
  itemsPerPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  resetPagination: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function usePagination<T>(items: T[] = [], itemsPerPage = 10): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => Math.ceil(items.length / itemsPerPage), [items.length, itemsPerPage]);

  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = useCallback(
    (page: number) => {
      const pageNumber = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(pageNumber);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    currentItems,
    totalItems: items.length,
    itemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    resetPagination,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

interface UseServerPaginationReturn {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPagination: () => void;
  updatePaginationInfo: (count: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useServerPagination(initialPage = 1, itemsPerPage = 10): UseServerPaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const updatePaginationInfo = useCallback(
    (count: number) => {
      setTotalItems(count);
      setTotalPages(Math.ceil(count / itemsPerPage));
    },
    [itemsPerPage]
  );

  const goToPage = useCallback(
    (page: number) => {
      const pageNumber = Math.max(1, Math.min(page, totalPages || 1));
      setCurrentPage(pageNumber);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    resetPagination,
    updatePaginationInfo,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

export default usePagination;
