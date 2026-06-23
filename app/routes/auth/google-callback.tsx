import { handleGoogleOAuthCallback } from "@/lib/api/auth";
import { sanitizeRedirectPath } from "utils/safe-redirect";
import { data } from "react-router";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = sanitizeRedirectPath(url.searchParams.get("state"));

  if (!code) {
    return data(
      { success: false, message: "Google authentication code is missing." },
      { status: 400 },
    );
  }

  return handleGoogleOAuthCallback(code, redirectTo);
}

export default function GoogleCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Finishing Google sign-in...
    </div>
  );
}
