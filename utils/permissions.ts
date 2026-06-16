// permissions.ts

import type { Role } from "types";

// export const ROLES = ["owner", "manager", "cashier", "stock_keeper"] as const;

// export type Role = (typeof ROLES)[number];

export const FEATURES = [
  "dashboard:full",
  "dashboard:limited",
  "manage:members",
  "manage:managers",
  "products:crud",
  "stock:movements",
  "invoice:create",
  "invoice:delete",
  "expenses:view",
  "expenses:manage",
  "business:manage",
  "business:delete",
  "customers:view",
  "customers:crud",
  "credits:manage",
  "reports:sales",
  "reports:inventory",
] as const;

export type Feature = (typeof FEATURES)[number];

export const PERMISSIONS: Record<Role, Feature[]> = {
  owner: [
    "dashboard:full",
    "manage:members",
    "manage:managers",
    "products:crud",
    "stock:movements",
    "invoice:create",
    "invoice:delete",
    "expenses:view",
    "expenses:manage",
    "business:manage",
    "business:delete",
    "customers:view",
    "customers:crud",
    "credits:manage",
    "reports:sales",
    "reports:inventory",
  ],

  manager: [
    "dashboard:limited",
    "manage:members",
    "products:crud",
    "stock:movements",
    "invoice:create",
    "invoice:delete",
    "expenses:view",
    "expenses:manage",
    "customers:view",
    "customers:crud",
    "credits:manage",
    "reports:sales",
    "reports:inventory",
  ],

  cashier: [
    "dashboard:limited",
    "invoice:create",
    "customers:view",
    "customers:crud",
    "credits:manage",
    "reports:sales",
  ],

  stock_keeper: [
    "dashboard:limited",
    "products:crud",
    "stock:movements",
    "reports:inventory",
  ],
  delivery: [],
  customer: [],
  wholesaler: [],
  partner: [],
};

/**
 * 
 * @param role 
 * @param feature what is being accessed
 * @returns boolean
 * @usage - 
 * * In Loaders/Actions
 * ```ts  requirePermission(user.role, "products:crud"); ```
 * * In the UI
 * ```ts
 *  {hasPermission(user.role, "manage:members") && (
        <ManageMembersButton />
    )}
        ```
        or
   ```ts
    {hasPermission(user.role, "business:delete") && (
        <DeleteBusinessButton />
    )}
  ```
 */
export function hasPermission(
  role: Role | undefined,
  feature: Feature,
): boolean {
  if (!role) return false;
  return PERMISSIONS[role]?.includes(feature) ?? false;
}

export function requirePermission(role: Role | undefined, feature: Feature) {
  if (!hasPermission(role, feature)) {
    throw new Error("Forbidden");
  }
}

export function canManageMember(
  currentUser: { id: string; role: Role },
  target: { id: string; role: Role },
) {
  if (currentUser.id === target.id) return false; // self
  if (target.role === "owner") return false; // owner undeletable

  if (currentUser.role === "owner") return true;

  if (currentUser.role === "manager" && target.role !== "manager") {
    return true;
  }

  return false;
}
