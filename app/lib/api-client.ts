/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BackendResponse, Pagination, ServerActionState } from "types";
import {
  cleanPayload,
  genericErrorState,
  genericNetworkError,
  getRateLimitMessage,
} from "utils";
import { BASE_URL } from "utils/endpoints";

interface FetchOptions extends RequestInit {
  token?: string; // Pass token explicitly
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async fetch<T>(
    endpoint: string,
    options: FetchOptions = {},
  ): Promise<ServerActionState & { data?: T; meta?: Pagination }> {
    const { token, ...fetchOptions } = options;

    if (!token) {
      // throw redirect(`/auth/signin`);
      throw new Error("Access token required for API requests");
    }

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...fetchOptions.headers,
        },
      });

      const raw = await res.json();
      const result = raw as BackendResponse;

      if (!res.ok) {
        const error = result.error;

        if (error?.code === "RATE_LIMIT_EXCEEDED") {
          return {
            success: false,
            message: getRateLimitMessage(error.details?.retry_after),
          };
        }

        if (error?.code === "VALIDATION_ERROR") {
          return { success: false, message: error.message };
        }

        if (error?.code === "INVALID_CREDENTIALS") {
          return { success: false, message: error.message || "Invalid credentials." };
        }

        return genericErrorState();
      }

      const resData = result.data as T;
      const resMeta = result.pagination as Pagination | undefined;

      return { success: true, data: resData, meta: resMeta };
    } catch (err) {
      return genericNetworkError((err as any).message) || genericErrorState();
    }
  }

  get<T>(endpoint: string, token: string, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, token, method: "GET" });
  }

  post<T>(endpoint: string, token: string, data?: any, options?: FetchOptions) {
    return this.fetch<T>(endpoint, {
      ...options,
      token,
      method: "POST",
      body: JSON.stringify(cleanPayload(data)),
    });
  }

  put<T>(endpoint: string, token: string, data?: any, options?: FetchOptions) {
    return this.fetch<T>(endpoint, {
      ...options,
      token,
      method: "PUT",
      body: JSON.stringify(cleanPayload(data)),
    });
  }

  delete<T>(endpoint: string, token: string, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, token, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
