import { AlertCircle } from "lucide-react";
import type { ServerActionState } from "types";

export function ProductFormActionAlert({
  actionData,
}: {
  actionData?: ServerActionState;
}) {
  if (!actionData || actionData.success) return null;

  const message =
    actionData.message ||
    (actionData.errors
      ? Object.values(actionData.errors).find(Boolean)
      : undefined);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="mx-4 mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive sm:mx-6"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
