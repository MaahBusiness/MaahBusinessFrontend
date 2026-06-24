import { organisationsApi } from "@/lib/api/organisation";
import { sanitizeRedirectPath } from "utils/safe-redirect";

const ACCESS_DENIED_PATTERNS = [
  "don't have access",
  "do not have access",
  "permission to access",
  "permission denied",
] as const;

export function isOrgAccessDenied(message?: string | null): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return ACCESS_DENIED_PATTERNS.some((pattern) => lower.includes(pattern));
}

export function extractOrgIdFromPath(path: string): string | null {
  const match = path.match(/^\/dashboard\/org\/([^/]+)/);
  return match?.[1] ?? null;
}

/** Maps a post-auth path to an org the user can access, or the org list. */
export async function resolvePostAuthRedirect(
  accessToken: string,
  redirectPath: string,
): Promise<string> {
  const safe = sanitizeRedirectPath(redirectPath);
  const orgId = extractOrgIdFromPath(safe);
  if (!orgId) return safe;

  const list = await organisationsApi.getAll(accessToken);
  if (!list.success || !list.data?.length) {
    return "/dashboard/organisations";
  }

  if (list.data.some((business) => business.id === orgId)) {
    return safe;
  }

  const fallbackOrgId = list.data[0].id;
  const subpath = safe.replace(/^\/dashboard\/org\/[^/]+/, "") || "/home";
  return `/dashboard/org/${fallbackOrgId}${subpath}`;
}
