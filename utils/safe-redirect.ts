export const DEFAULT_AUTH_REDIRECT = "/dashboard";

/**
 * Returns a safe same-origin relative path for post-auth redirects.
 * Rejects absolute URLs, protocol-relative URLs, and backslash tricks.
 */
export function sanitizeRedirectPath(
  raw: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT,
): string {
  if (!raw || typeof raw !== "string") return fallback;

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("\0")) return fallback;

  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
