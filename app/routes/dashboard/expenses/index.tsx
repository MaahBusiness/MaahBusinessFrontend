import type { Route } from ".react-router/types/app/routes/dashboard/expenses/+types";
import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { redirect, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  Clock,
  DollarSign,
  Receipt,
  Wallet,
} from "lucide-react";
import { expenseCols } from "@/components/expenses/expense-columns";
import { ExpenseTableToolbar } from "@/components/expenses/expense-table-toolbar";
import { AddExpenseDialog } from "@/components/expenses/expense-dialogs";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { OrgPageShell } from "@/components/layout/org-page-shell";
import { ProductStatsGrid } from "@/components/products/product-stats-grid";
import { DataTable } from "@/components/ui/data-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useExpenses } from "@/hooks/use-expenses";
import { useOrganisation } from "@/hooks/use-organisation";
import { financeKeys } from "@/lib/api/finance";
import { invalidateOrgDashboard } from "@/lib/api/dashboard";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { handleExpenseActions } from "services/api";
import type { Expense } from "@/lib/finance-types";
import type { ServerActionState } from "types";
import { expenseFilterParsers, formatDisplayAmount, parseSearchParams } from "utils";
import { hasPermission } from "utils/permissions";
import type { ExpenseFilters } from "@/lib/finance-types";

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & { data?: Expense }
> {
  const { id } = params;
  if (!id) throw redirect("organisations");

  const formData = await request.formData();
  const session = await getSession(request);

  return handleExpenseActions({ formData, id, session });
}

export default function ExpensesPage({ actionData }: Route.ComponentProps) {
  const { businessMember } = useOrganisation();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const filters = parseSearchParams<ExpenseFilters>(
    searchParams,
    expenseFilterParsers,
  );

  const { listQuery, summaryQuery } = useExpenses(filters);

  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success && id) {
      void queryClient.invalidateQueries({ queryKey: financeKeys.org(id) });
      void invalidateOrgDashboard(queryClient, id);
    }
  }, [actionData, id, queryClient]);

  const expenses = listQuery.data?.data ?? [];
  const summary = summaryQuery.data?.data;

  const statItems = useMemo(() => {
    const pending = expenses.filter((e) => !e.is_approved).length;
    const approved = expenses.filter((e) => e.is_approved).length;
    const pageTotal = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );

    return [
      {
        label: "Total expenses",
        value: summary
          ? formatDisplayAmount(summary.total_amount)
          : formatDisplayAmount(pageTotal),
        accent: "orange" as const,
        icon: Wallet,
        hint: summary
          ? `${summary.total_count} in period`
          : "Current page total",
      },
      {
        label: "Records",
        value: String(listQuery.data?.meta?.count ?? expenses.length),
        accent: "violet" as const,
        icon: Receipt,
        hint: "Matching filters",
      },
      {
        label: "Pending",
        value: String(pending),
        accent: "orange" as const,
        icon: Clock,
        hint: "Awaiting approval",
      },
      {
        label: "Approved",
        value: String(approved),
        accent: "emerald" as const,
        icon: DollarSign,
        hint: "On current page",
      },
    ];
  }, [expenses, listQuery.data?.meta?.count, summary]);

  const hasActiveFilters = searchParams.toString().length > 0;
  const hasAnyExpenses = (summary?.total_count ?? listQuery.data?.meta?.count ?? 0) > 0;

  if (listQuery.isLoading && !listQuery.data) return <DataTableSkeleton />;
  if (!listQuery.data?.success) return <RequestFailed refetch={listQuery.refetch} />;

  const canManage = hasPermission(businessMember?.role, "expenses:manage");
  const showOnboardingEmpty =
    expenses.length === 0 && !hasActiveFilters && !hasAnyExpenses;

  return (
    <OrgPageShell orbs={["violet", "emerald"]}>
      <div className="mb-1 min-w-0 space-y-4 sm:mb-2">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Expenses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track business spending, approvals, and payment records.
          </p>
        </div>

        <ProductStatsGrid items={statItems} />
      </div>

      <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-orange-500/15 bg-card/80 shadow-sm backdrop-blur-sm">
        {showOnboardingEmpty ? (
          <Empty className="border-0 bg-transparent py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Wallet className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No expenses yet</EmptyTitle>
              <EmptyDescription className="max-w-sm text-pretty">
                Record your first business expense to track spending and keep
                your dashboard profit metrics accurate.
              </EmptyDescription>
            </EmptyHeader>
            {canManage && <AddExpenseDialog />}
          </Empty>
        ) : (
          <DataTable
            data={expenses}
            meta={listQuery.data.meta}
            columns={expenseCols}
            density="compact"
            DataTableToolbar={ExpenseTableToolbar}
          />
        )}
      </div>
    </OrgPageShell>
  );
}
