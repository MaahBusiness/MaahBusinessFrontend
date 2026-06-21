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
  "invoice:archive",
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
    "invoice:archive",
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
    "invoice:archive",
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
    "invoice:archive",
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

/** True if the role has at least one of the given features (or when features is omitted). */
export function matchesAnyPermission(
  role: Role | undefined,
  features?: Feature | Feature[],
): boolean {
  if (!features) return true;
  const list = Array.isArray(features) ? features : [features];
  return list.some((feature) => hasPermission(role, feature));
}

/** Normalize API role strings (e.g. "Owner", "STOCK_KEEPER") to app Role. */
export function normalizeRole(role: Role | string | undefined): Role | undefined {
  if (!role) return undefined;
  const key = String(role).trim().toLowerCase().replace(/-/g, "_");
  if (key in PERMISSIONS) return key as Role;
  return undefined;
}

export function requirePermission(role: Role | undefined, feature: Feature) {
  if (!hasPermission(role, feature)) {
    throw new Error("Forbidden");
  }
}

/** Soft-remove (archive) — cashiers see this as “Remove”. */
export function canArchiveInvoice(role: Role | undefined): boolean {
  return (
    hasPermission(role, "invoice:archive") ||
    hasPermission(role, "invoice:delete")
  );
}

/** Permanent delete — owners and managers only. */
export function canHardDeleteInvoice(role: Role | undefined): boolean {
  return hasPermission(role, "invoice:delete");
}

/** Record a payment against outstanding balance. */
export function canRecordInvoicePayment(role: Role | undefined): boolean {
  return (
    hasPermission(role, "credits:manage") ||
    hasPermission(role, "invoice:create")
  );
}

export function invoiceHasOutstandingBalance(invoice: {
  remaining_amount?: number;
  status?: string;
}): boolean {
  return (
    Number(invoice.remaining_amount ?? 0) > 0 &&
    invoice.status !== "CANCELLED"
  );
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
