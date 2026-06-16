import { useCloseOnActionSuccess } from "@/hooks/use-close-on-action-success";

export function useCloseDrawerOnActionSuccess(
  open: boolean,
  setOpen: (open: boolean) => void,
  expectedIntent: string,
  onAfterClose?: () => void,
) {
  useCloseOnActionSuccess(open, () => setOpen(false), expectedIntent, onAfterClose);
}
