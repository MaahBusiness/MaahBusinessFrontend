// contexts/auth-context.tsx
import { organisationKeys } from "@/lib/api/organisation";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect } from "react";
import type { User, SessionData } from "types";

type AuthContextType = {
  user?: User;
  accessToken?: string;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  session?: SessionData;
  children: React.ReactNode;
}

export function AuthProvider({ session, children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const user = session?.user;
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && user.email_verified,
    accessToken: session?.accessToken, // NEW: Exposing token for Tanstack Usage
  };

  // Show toasts based on action results
  useEffect(() => {
    if (!session?.user) {
      // Nuclear option - invalidate all cache stores when no user (sign out)
      queryClient.invalidateQueries({ queryKey: organisationKeys.all });
    }
  }, [session?.user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

//  Hook for protected routes
export function useRequireAuth() {
  const auth = useAuth();
  if (!auth.isAuthenticated) {
    throw new Error("This route requires authentication");
  }
  return auth;
}
