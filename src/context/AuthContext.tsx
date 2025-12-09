import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { User, UserRole } from "../types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem("user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback((token: string, userData?: User) => {
    localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("notificationCount");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const hasAccess = useCallback(
    (allowedRoles: UserRole[]): boolean => {
      if (!user || !user.role) return false;
      return allowedRoles.some((role) => role.toLowerCase() === user.role.toLowerCase());
    },
    [user]
  );

  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://victbackendmanagement.onrender.com/api/v1/user-info/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        updateUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      
      // Invalid token
      logout();
      return false;
    } catch {
      // Keep existing state on network error
      return isAuthenticated;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout, updateUser]);

  // Listen for logout events from API interceptor
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [logout]);

  // Listen for storage changes (other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        if (e.newValue) {
          setIsAuthenticated(true);
          const userStr = localStorage.getItem("user");
          if (userStr) setUser(JSON.parse(userStr));
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    hasAccess,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
