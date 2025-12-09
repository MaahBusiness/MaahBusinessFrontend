import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import type { ApiError } from "../types";

export interface UseAsyncReturn<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  execute: <Args extends unknown[]>(asyncFunction: (...args: Args) => Promise<T>, ...args: Args) => Promise<T>;
  reset: () => void;
}

/**
 * Hook for handling async operations with loading, error, and data states
 */
export function useAsync<T = unknown>(): UseAsyncReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async <Args extends unknown[]>(
    asyncFunction: (...args: Args) => Promise<T>,
    ...args: Args
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const errorData = axiosError.response?.data;
      
      const errorMessage = errorData?.detail 
        || errorData?.message 
        || errorData?.error
        || (err as Error).message 
        || "An error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    setData,
    setError,
    execute,
    reset,
  };
}

export interface UseFetchReturn<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  refetch: () => Promise<T | undefined>;
}

/**
 * Hook for fetching data on mount or when dependencies change
 */
export function useFetch<T>(fetchFunction: () => Promise<T>): UseFetchReturn<T> {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const refetch = useCallback(async (): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
      return result;
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const errorData = axiosError.response?.data;
      
      const errorMessage = errorData?.detail 
        || errorData?.message 
        || (err as Error).message 
        || "An error occurred";
      setError(errorMessage);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  return {
    isLoading,
    error,
    data,
    setData,
    refetch,
  };
}

export default useAsync;

