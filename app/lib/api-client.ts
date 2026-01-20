import { redirect } from "react-router";
import type { BackendResponse, ServerActionState } from "types";
import {
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
  ): Promise<ServerActionState & { data?: T }> {
    const { token, ...fetchOptions } = options;


    if (!token) {
      // throw redirect(`/auth/signin`);
      throw new Error("Access token required for API requests");
    }

    console.log(`URL::${this.baseUrl}${endpoint}`, fetchOptions.method);

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
        console.log("LOG::", endpoint, fetchOptions.method, raw);
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

        return genericErrorState();
      }

      const resData = result.data as T;

      console.log("LOG::", endpoint, fetchOptions.method, resData);

      return { success: true, data: resData };
    } catch (err) {
      console.log(
        "LOG::CATCH",
        endpoint,
        fetchOptions.method,
        (err as any).message,
      );
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
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, token: string, data?: any, options?: FetchOptions) {
    return this.fetch<T>(endpoint, {
      ...options,
      token,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string, token: string, options?: FetchOptions) {
    return this.fetch<T>(endpoint, { ...options, token, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
