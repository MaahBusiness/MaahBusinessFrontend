// session.server.ts
import { createCookie, redirect } from "react-router";
import type { BackendResponse, GenericResponse, SessionData } from "types";
import { BASE_URL, REFRESH_TOKEN_URL } from "utils/endpoints";

const REFRESH_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

// ------------------------------
// Cookie configuration
// ------------------------------
export const sessionCookie = createCookie("rp-session", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

// ------------------------------
// Read session from request
// ------------------------------
export async function getSession(
  request: Request,
): Promise<SessionData | null> {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const session = await sessionCookie.parse(cookieHeader);
  if (!session?.accessToken || !session?.refreshToken) return null;

  return session;
}

// ------------------------------
// Refresh access token safely
// ------------------------------
async function refreshAccessToken(
  refreshToken: string,
): Promise<SessionData | null> {
  console.log("REFRESHING REFRESH TOKEN", refreshToken);
  console.log("ENDPOINT::", `${BASE_URL}${REFRESH_TOKEN_URL}`);
  try {
    const res = await fetch(`${BASE_URL}${REFRESH_TOKEN_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const raw = await res.json();

    if (!res.ok) {
      console.log("REFRESH FAILED", raw);
      return null;
    }

    const data = raw as BackendResponse;

    const accessToken = (data.data as GenericResponse)?.access_token;
    const newRefreshToken = (data.data as GenericResponse)?.refresh_token;
    // const user = data.data?.user;

    if (!accessToken || !newRefreshToken) {
      console.log("No tokens returned");
      return null;
    }

    console.log("token refresh success");
    console.log(
      newRefreshToken,
      refreshToken,
      newRefreshToken === refreshToken,
    );
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw redirect("/auth/signin");
  }
}

// ------------------------------
// Token validation (cheap check)
// ------------------------------
async function validateAccessToken(token: string): Promise<boolean> {
  // console.log("VALIDATING ACCESS TOKEN");
  try {
    const [, payload] = token.split(".");
    if (!payload) return false;

    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf-8"),
    );

    // console.log(payload, decoded);
    // Check if token is expired (with 30 second buffer)
    return decoded.exp * 1000 > Date.now() + 30000;
  } catch {
    return false;
  }
}

function getTokenStatus(token: string): "valid" | "refresh" | "expired" {
  try {
    const [, payload] = token.split(".");
    if (!payload) return "expired";

    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf-8"),
    );

    const expiresAt = decoded.exp * 1000;
    const now = Date.now();

    if (expiresAt <= now) return "expired";

    if (expiresAt - now <= REFRESH_THRESHOLD_MS) {
      return "refresh";
    }

    return "valid";
  } catch {
    return "expired";
  }
}

let refreshPromise: Promise<any> | null = null;

async function safeRefresh(refreshToken: string) {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(refreshToken).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ------------------------------
// Main auth helper (used by loaders)
// ------------------------------
export async function requireUserSession(request: Request) {
  const session = await getSession(request);

  if (!session) {
    return { headers: undefined };
  }

  const status = getTokenStatus(session.accessToken);

  // ✅ Token is healthy
  if (status === "valid") {
    return { session, headers: undefined };
  }

  // 🔄 Token is near expiry OR expired → refresh
  const refreshed = await refreshAccessToken(session.refreshToken);

  if (!refreshed && status === "expired") {
    // ❌ Refresh token invalid → sign out
    return {
      headers: await destroySession(),
    };
  }

  // ✅ Refresh succeeded
  return {
    session: { ...session, ...refreshed },
    headers: {
      "Set-Cookie": await commitSession({
        ...session,
        ...refreshed,
      }),
    },
  };
}

export async function commitSession(session: SessionData) {
  return sessionCookie.serialize(session);
}

// ------------------------------
// Destroy session (for logout)
// ------------------------------
export async function destroySession() {
  return {
    "Set-Cookie": await sessionCookie.serialize("", {
      maxAge: 0,
      expires: new Date(0),
    }),
  };
}
