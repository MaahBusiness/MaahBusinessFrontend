import { isOrgAccessDenied } from "@/lib/org-access";
import type { ServerActionState } from "types";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

/** Redirect to the org list when the current org is forbidden for this user. */
export function useOrgAccessRedirect(
  result: (ServerActionState & { data?: unknown }) | undefined,
  opts?: { enabled?: boolean },
) {
  const navigate = useNavigate();
  const enabled = opts?.enabled ?? true;

  useEffect(() => {
    if (!enabled || !result || result.success) return;
    if (!isOrgAccessDenied(result.message)) return;

    toast.error(result.message ?? "You don't have access to this organisation.", {
      id: "org-access-denied",
    });
    navigate("/dashboard/organisations", { replace: true });
  }, [enabled, navigate, result]);
}
