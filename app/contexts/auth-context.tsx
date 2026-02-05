// contexts/auth-context.tsx
import { organisationKeys } from "@/lib/api/organisation";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import type { User, SessionData } from "types";

type AuthContextType = {
  user?: User;
  accessToken?: string;
  isAuthenticated: boolean;
  setUser: Dispatch<SetStateAction<User | undefined>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  session?: SessionData;
  children: React.ReactNode;
}

export function AuthProvider({ session, children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState(session?.user);

  // Show toasts based on action results
  useEffect(() => {
    // console.log({ session, sesh });
    // setSesh(session);
    if (!session?.user) {
      // Nuclear option - invalidate all cache stores when no user (sign out)
      queryClient.invalidateQueries({ queryKey: organisationKeys.all });
    }
    if (session?.refreshToken && !session.user)
      toast.error("Failed to re-authenticate user. Please sign in again");
  }, [session]);

  const value: AuthContextType = {
    user: session?.user,
    isAuthenticated: !!session?.user && session?.user.email_verified,
    accessToken: session?.accessToken, // NEW: Exposing token for Tanstack Usage
    setUser,
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
