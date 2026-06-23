import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";

export function QueryHydration({
  state,
  children,
}: {
  state?: DehydratedState | null;
  children: React.ReactNode;
}) {
  if (!state) return children;

  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
