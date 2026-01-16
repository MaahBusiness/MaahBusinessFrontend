// contexts/auth-context.tsx
import { createContext, useContext } from "react";
import type { User, SessionData } from "types";

type AuthContextType = {
  user?: User;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  session?: SessionData;
  children: React.ReactNode;
}

export function AuthProvider({ session, children }: AuthProviderProps) {
  const user = session?.user;
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && user.email_verified,
  };

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
