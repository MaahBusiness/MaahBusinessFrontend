import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useAuthErrorRedirect } from "@/hooks/use-auth-error-redirect";
import { assertAccessToken } from "@/lib/auth-errors";
import { invalidateOrgDashboard } from "@/lib/api/dashboard";
import { financeApi, financeKeys } from "@/lib/api/finance";
import type { Expense, ExpenseFilters } from "@/lib/finance-types";

export function useExpenses(filters?: ExpenseFilters) {
  const { id: orgId } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (!orgId) return;
    void queryClient.invalidateQueries({ queryKey: financeKeys.org(orgId) });
    void invalidateOrgDashboard(queryClient, orgId);
  };

  const listQuery = useQuery({
    queryKey: financeKeys.list(orgId!, filters),
    queryFn: async () => {
      assertAccessToken(accessToken, pathname);
      if (!orgId) throw new Error("Organisation context required");
      return financeApi.listExpenses(accessToken, orgId, filters);
    },
    enabled: !!accessToken && !!orgId,
  });

  const summaryQuery = useQuery({
    queryKey: financeKeys.summary(orgId!, {
      start_date: filters?.start_date,
      end_date: filters?.end_date,
    }),
    queryFn: async () => {
      assertAccessToken(accessToken, pathname);
      if (!orgId) throw new Error("Organisation context required");
      return financeApi.getSummary(accessToken, orgId, {
        start_date: filters?.start_date,
        end_date: filters?.end_date,
      });
    },
    enabled: !!accessToken && !!orgId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!accessToken) throw new Error("Unauthorized");
      return financeApi.deleteExpense(accessToken, expenseId);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message ?? "Expense deleted");
        invalidate();
      } else toast.error(res.message);
    },
    onError: () => toast.error("Failed to delete expense"),
  });

  const approveMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!accessToken) throw new Error("Unauthorized");
      return financeApi.updateExpense(accessToken, expenseId, {
        is_approved: true,
      });
    },
    onSuccess: (res) => {
      if (!res.success || !orgId) {
        toast.error(res.message);
        return;
      }

      const updated = res.data;
      if (updated) {
        queryClient.setQueriesData(
          { queryKey: financeKeys.org(orgId) },
          (
            old:
              | { data?: Expense[]; success?: boolean; meta?: unknown }
              | undefined,
          ) => {
            if (!old?.data || !Array.isArray(old.data)) return old;
            return {
              ...old,
              data: old.data.map((e) =>
                e.id === updated.id ? { ...e, ...updated } : e,
              ),
            };
          },
        );
      }

      void queryClient.invalidateQueries({
        queryKey: financeKeys.summary(orgId),
      });
      void invalidateOrgDashboard(queryClient, orgId);
      toast.success("Expense approved");
    },
    onError: () => toast.error("Failed to approve expense"),
  });

  useAuthErrorRedirect(listQuery.error, pathname);

  return {
    listQuery,
    summaryQuery,
    deleteExpense: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    approveExpense: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    invalidate,
  };
}

export function useExpenseHistory(expenseId: string | undefined, enabled: boolean) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: financeKeys.history(expenseId!),
    queryFn: async () => {
      if (!accessToken || !expenseId) throw new Error("Unauthorized");
      return financeApi.getHistory(accessToken, expenseId);
    },
    enabled: !!accessToken && !!expenseId && enabled,
  });
}
