const DEFAULT_API_ORIGIN = "https://maahbusiness.trustconsulting.tech";

const LOCAL_API_ORIGINS = [
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://0.0.0.0:8000",
] as const;

const LOCAL_WS_ORIGINS = [
  "ws://localhost:3000",
  "ws://127.0.0.1:3000",
  "ws://localhost:5173",
  "ws://127.0.0.1:5173",
] as const;

function viteEnv(): Record<string, string | boolean | undefined> | undefined {
  try {
    return import.meta.env as Record<string, string | boolean | undefined>;
  } catch {
    return undefined;
  }
}

function readApiBaseUrl(): string | undefined {
  const env = viteEnv();
  const fromVite = env?.VITE_API_BASE_URL;
  if (typeof fromVite === "string" && fromVite.length > 0) {
    return fromVite;
  }

  const fromProcess = process.env.VITE_API_BASE_URL ?? process.env.API_BASE_URL;
  if (typeof fromProcess === "string" && fromProcess.length > 0) {
    return fromProcess;
  }

  if (process.env.NODE_ENV === "production") {
    return `${DEFAULT_API_ORIGIN}/api/v1`;
  }

  return undefined;
}

function getApiOrigin(): string | undefined {
  const raw = readApiBaseUrl();
  if (!raw) return undefined;

  try {
    return new URL(raw).origin;
  } catch {
    return undefined;
  }
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.endsWith(".localhost")
  );
}

function isProductionRequest(request?: Request): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (!request) return false;

  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";

  if (isLocalHostname(hostname)) {
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

function isLocalRequest(request?: Request): boolean {
  if (!request) {
    return viteEnv()?.DEV === true || process.env.NODE_ENV !== "production";
  }

  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";

  return isLocalHostname(hostname);
}

function buildConnectSrc(request?: Request): string {
  const origins = new Set<string>(["'self'"]);

  const apiOrigin = getApiOrigin();
  if (apiOrigin) origins.add(apiOrigin);

  if (isLocalRequest(request) || viteEnv()?.DEV === true) {
    for (const origin of LOCAL_API_ORIGINS) origins.add(origin);
    for (const origin of LOCAL_WS_ORIGINS) origins.add(origin);
  }

  return [...origins].join(" ");
}

function buildContentSecurityPolicy(request?: Request): string {
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
    `connect-src ${buildConnectSrc(request)}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ];

  if (isProductionRequest(request)) {
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

  const production = isProductionRequest(request);

  const headers: SecurityHeaderMap = {
    "Content-Security-Policy": buildContentSecurityPolicy(request),
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
    headers["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains; preload";
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
