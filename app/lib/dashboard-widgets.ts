import type { Feature } from "utils/permissions";
import { matchesAnyPermission } from "utils/permissions";
import type { Role } from "types";

export function canShowDashboardWidget(
  role: Role | undefined,
  permission?: Feature | Feature[],
): boolean {
  return matchesAnyPermission(role, permission);
}

export function filterByRole<T extends { permission?: Feature | Feature[] }>(
  role: Role | undefined,
  items: readonly T[],
): T[] {
  return items.filter((item) => canShowDashboardWidget(role, item.permission));
}
