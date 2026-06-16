import { useEffect, useRef } from "react";
import { useActionData, useNavigation } from "react-router";
import type { ServerActionState } from "types";

/**
 * Closes a dialog after a successful route action.
 * navigation.formData is cleared when state becomes idle, so we capture intent during submit.
 */
export function useCloseOnActionSuccess(
  open: boolean,
  onClose: () => void,
  expectedIntent: string,
  onAfterClose?: () => void,
) {
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();
  const submittedIntent = useRef<string | null>(null);

  useEffect(() => {
    if (navigation.state === "submitting" && navigation.formData) {
      submittedIntent.current = navigation.formData.get("intent") as string;
    }
  }, [navigation.state, navigation.formData]);

  useEffect(() => {
    if (
      open &&
      actionData?.success &&
      navigation.state === "idle" &&
      submittedIntent.current === expectedIntent
    ) {
      onClose();
      submittedIntent.current = null;
      onAfterClose?.();
    }

    if (
      open &&
      actionData &&
      !actionData.success &&
      navigation.state === "idle" &&
      submittedIntent.current === expectedIntent
    ) {
      submittedIntent.current = null;
    }
  }, [actionData, navigation.state, open, expectedIntent, onClose, onAfterClose]);
}
