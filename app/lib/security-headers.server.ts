const DEFAULT_API_ORIGIN = "https://maahbusiness.trustconsulting.tech";

function getApiOrigin(): string | undefined {
  const raw =
    process.env.VITE_API_BASE_URL ??
    (process.env.NODE_ENV === "production" ? `${DEFAULT_API_ORIGIN}/api/v1` : undefined);

  if (!raw) return undefined;

  try {
    return new URL(raw).origin;
  } catch {
    return undefined;
  }
}

function isProductionRequest(request?: Request): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (!request) return true;

  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return false;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

function buildContentSecurityPolicy(apiOrigin?: string): string {
  const connectSrc = ["'self'", apiOrigin].filter(Boolean).join(" ");

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline'`,
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    `connect-src ${connectSrc}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];

  if (process.env.NODE_ENV === "production") {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export type SecurityHeaderMap = Record<string, string>;

/** Security headers applied to HTML, data, and static responses. */
export function getSecurityHeaders(request?: Request): SecurityHeaderMap {
  if (process.env.SECURITY_HEADERS_DISABLED === "true") {
    return {};
  }

  const apiOrigin = getApiOrigin();
  const production = isProductionRequest(request);

  const headers: SecurityHeaderMap = {
    "Content-Security-Policy": buildContentSecurityPolicy(apiOrigin),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-DNS-Prefetch-Control": "off",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-site",
  };

  if (production) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }

  return headers;
}

export function applySecurityHeaders(
  target: Headers | { set: (name: string, value: string) => void },
  request?: Request,
) {
  for (const [name, value] of Object.entries(getSecurityHeaders(request))) {
    target.set(name, value);
  }
}
