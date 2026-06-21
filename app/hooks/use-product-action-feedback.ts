import { useEffect, useRef } from "react";
import { useNavigation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ServerActionState } from "types";
import { organisationKeys } from "@/lib/api/organisation";
import { invalidateOrgDashboard } from "@/lib/api/dashboard";
import { invalidateOrgInventory } from "@/lib/api/inventory";

/** Shows backend messages once and invalidates product queries on success. */
export function useProductActionFeedback(
  actionData: (ServerActionState & { data?: { name?: string; id?: string } }) | undefined,
  orgId?: string,
) {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const lastHandled = useRef<unknown>(null);

  useEffect(() => {
    if (!actionData || navigation.state !== "idle") return;
    if (lastHandled.current === actionData) return;
    lastHandled.current = actionData;

    if (actionData.success) {
      const msg =
        actionData.message ||
        (actionData.data?.name
          ? `"${actionData.data.name}" saved successfully.`
          : "Product saved successfully.");
      toast.success(msg);

      if (orgId) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.prodlist(orgId),
        });
        if (actionData.data?.id) {
          queryClient.invalidateQueries({
            queryKey: organisationKeys.product(actionData.data.id),
          });
        }
        void invalidateOrgDashboard(queryClient, orgId);
        void invalidateOrgInventory(queryClient, orgId);
      }
      return;
    }

    if (actionData.message) {
      toast.error(actionData.message);
      return;
    }

    if (actionData.errors) {
      const messages = Object.values(actionData.errors).filter(Boolean);
      if (messages.length) toast.error(messages[0] as string);
    }
  }, [actionData, navigation.state, orgId, queryClient]);
}
