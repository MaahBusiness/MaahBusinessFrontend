import { useEffect, useRef } from "react";
import { useNavigation } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Invoice, ServerActionState } from "types";
import { organisationKeys } from "@/lib/api/organisation";

/** Shows backend messages once and invalidates invoice queries on success. */
export function useSalesActionFeedback(
  actionData:
    | (ServerActionState & { data?: Invoice })
    | undefined,
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
        (actionData.data?.number
          ? `Invoice #${actionData.data.number} saved successfully.`
          : "Invoice saved successfully.");
      toast.success(msg);

      if (orgId) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoices(orgId),
        });
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoiceList(orgId),
        });
        queryClient.invalidateQueries({
          queryKey: organisationKeys.clientList(orgId),
        });
        if (actionData.data?.id) {
          queryClient.invalidateQueries({
            queryKey: organisationKeys.invoice(actionData.data.id),
          });
        }
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
