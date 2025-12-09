import { redirect } from "react-router-dom";
import { authService } from "../services";
import type { User } from "../types";

export interface AuthLoaderData {
  user: User;
}

/**
 * Loader that requires authentication
 * Redirects to login if not authenticated
 */
export async function requireAuthLoader(): Promise<AuthLoaderData | Response> {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/login");
  }

  try {
    const user = await authService.getUserInfo();
    localStorage.setItem("user", JSON.stringify(user));
    return { user };
  } catch {
    // Token is invalid, clear and redirect
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return redirect("/login");
  }
}

/**
 * Loader that requires manager role
 */
export async function requireManagerLoader(): Promise<AuthLoaderData | Response> {
  const token = localStorage.getItem("token");

  if (!token) {
    return redirect("/login");
  }

  try {
    const user = await authService.getUserInfo();
    localStorage.setItem("user", JSON.stringify(user));

    if (user.role !== "manager") {
      return redirect("/");
    }

    return { user };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return redirect("/login");
  }
}

/**
 * Loader for guest-only pages (login, signup)
 * Redirects to home if already authenticated
 */
export async function guestOnlyLoader(): Promise<null | Response> {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  try {
    const user = await authService.getUserInfo();
    localStorage.setItem("user", JSON.stringify(user));

    // Already authenticated, redirect based on role
    if (user.role === "manager") {
      return redirect("/ArchiveManager");
    }
    return redirect("/");
  } catch {
    // Token is invalid, allow access to guest page
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}

/**
 * Get cached user from localStorage (for non-blocking checks)
 */
export function getCachedUser(): User | null {
  try {
    const cached = localStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token");
}

