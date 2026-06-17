import { useMemo } from "react";
import { CreditCard, Receipt, TrendingUp, UserRound } from "lucide-react";
import { useOrganisation } from "@/hooks/use-organisation";
import type { ProductStatItem } from "@/components/products/product-stats-grid";
import { formatDisplayAmount } from "utils";
import { hasPermission } from "utils/permissions";
import type { Role } from "types";

/** Live KPI tiles for cashier / staff home — backed by organisation APIs. */
export function useCashierStats(orgId: string, role: Role) {
  const { fetchInvoices, fetchClients } = useOrganisation();

  const canSales = hasPermission(role, "invoice:create");
  const canClients = hasPermission(role, ["customers:view", "customers:crud"]);

  const invoices = fetchInvoices(undefined, { enabled: canSales });
  const clients = fetchClients(undefined, { enabled: canClients });

  const invoiceList = invoices.data?.data ?? [];
  const clientList = clients.data?.data ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const items = useMemo<ProductStatItem[]>(() => {
    const todayInvoices = invoiceList.filter((inv) =>
      inv.created_at?.startsWith(today),
    );
    const todayTotal = todayInvoices.reduce(
      (sum, inv) => sum + Number(inv.total),
      0,
    );
    const amountDue = invoiceList.reduce(
      (sum, inv) => sum + Number(inv.remaining_amount || 0),
      0,
    );
    const openCredits = invoiceList.filter(
      (inv) => Number(inv.remaining_amount) > 0,
    ).length;

    const tiles: ProductStatItem[] = [];

    if (canSales) {
      tiles.push(
        {
          label: "Today's revenue",
          value: invoices.isLoading ? "…" : formatDisplayAmount(todayTotal),
          accent: "violet",
          icon: TrendingUp,
          hint: `${todayInvoices.length} invoice${todayInvoices.length !== 1 ? "s" : ""} today`,
        },
        {
          label: "Open balance",
          value: invoices.isLoading ? "…" : formatDisplayAmount(amountDue),
          accent: "orange",
          icon: CreditCard,
          hint: `${openCredits} with amount due`,
        },
        {
          label: "Total invoices",
          value: invoices.isLoading
            ? "…"
            : String(invoices.data?.meta?.count ?? invoiceList.length),
          accent: "emerald",
          icon: Receipt,
          hint: "Recorded in this store",
        },
      );
    }

    if (canClients) {
      tiles.push({
        label: "Customers",
        value: clients.isLoading
          ? "…"
          : String(clients.data?.meta?.count ?? clientList.length),
        accent: "rose",
        icon: UserRound,
        hint: "Active client records",
      });
    }

    return tiles;
  }, [
    canClients,
    canSales,
    clientList.length,
    clients.data?.meta?.count,
    clients.isLoading,
    invoiceList,
    invoices.data?.meta?.count,
    invoices.isLoading,
    today,
  ]);

  const isLoading =
    (canSales && invoices.isLoading) || (canClients && clients.isLoading);

  return { items, isLoading, invoiceList };
}
