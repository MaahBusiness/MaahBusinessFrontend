import { isAuthRequiredError } from "@/lib/auth-errors";
import { sanitizeRedirectPath } from "utils/safe-redirect";
import { useEffect } from "react";
import { useNavigate } from "react-router";

/** Redirects to sign-in when a TanStack Query error is an AuthRequiredError. */
export function useAuthErrorRedirect(
  error: unknown,
  fallbackReturnPath: string,
) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthRequiredError(error)) return;

    const returnPath = sanitizeRedirectPath(
      error.returnPath || fallbackReturnPath,
    );
    navigate(`/auth/signin?redirectTo=${encodeURIComponent(returnPath)}`, {
      replace: true,
    });
  }, [error, fallbackReturnPath, navigate]);
}
