import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
  Trash2Icon,
} from "lucide-react";
import { useSearchParams } from "react-router";
import { expenseFilterParsers, parseSearchParams } from "utils";
import type { ExpenseFilters } from "@/lib/finance-types";
import { useOrganisation } from "@/hooks/use-organisation";
import { useExpenses } from "@/hooks/use-expenses";
import { hasPermission } from "utils/permissions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  ExpenseDetailsDialog,
  EditExpenseDialog,
} from "@/components/expenses/expense-dialogs";

export function ExpenseItemActions({
  expense,
  className,
  compact,
}: {
  expense: Expense;
  className?: string;
  compact?: boolean;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseSearchParams<ExpenseFilters>(
    searchParams,
    expenseFilterParsers,
  );
  const { businessMember, isLoading } = useOrganisation();
  const { deleteExpense, approveExpense, isDeleting, isApproving } =
    useExpenses(filters);

  const canView = hasPermission(businessMember?.role, "expenses:view");
  const canManage = hasPermission(businessMember?.role, "expenses:manage");
  const compactBtn = compact ? "h-7 w-7 shrink-0" : undefined;

  if (isLoading || !businessMember) {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        className={cn("h-7 w-7 shrink-0", className)}
        disabled
        aria-hidden
      />
    );
  }

  if (!canView) return null;

  const handleDelete = () => {
    deleteExpense(expense.id, {
      onSuccess: (res) => {
        if (res?.success) setDeleteOpen(false);
      },
    });
  };

  const handleApprove = () => {
    if (searchParams.get("is_approved") === "false") {
      setSearchParams((params) => {
        params.delete("is_approved");
        return params;
      });
    }
    approveExpense(expense.id);
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-end gap-1 pr-2",
          compact ? "flex-nowrap" : "flex-wrap gap-1.5",
          className,
        )}
      >
        <Button
          type="button"
          variant="outline"
          size={compact ? "icon-sm" : "sm"}
          className={cn(
            compactBtn,
            "gap-1.5 border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/10 hover:text-violet-700",
          )}
          title="View details"
          onClick={() => setViewOpen(true)}
        >
          <Eye className="size-3.5" />
          {!compact && <span className="hidden tablet:inline">View</span>}
        </Button>

        {canManage && (
          <>
            {!expense.is_approved && (
              <Button
                type="button"
                variant="outline"
                size={compact ? "icon-sm" : "sm"}
                className={cn(
                  compactBtn,
                  "gap-1.5 border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 hover:text-emerald-700",
                )}
                title="Approve expense"
                disabled={isApproving}
                onClick={handleApprove}
              >
                {isApproving ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                {!compact && (
                  <span className="hidden tablet:inline">Approve</span>
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size={compact ? "icon-sm" : "sm"}
              className={cn(
                compactBtn,
                "gap-1.5 border-blue-500/25 bg-blue-500/5 hover:bg-blue-500/10 hover:text-blue-700",
              )}
              title="Edit expense"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-3.5" />
              {!compact && <span className="hidden tablet:inline">Edit</span>}
            </Button>
            <Button
              type="button"
              variant="outline"
              size={compact ? "icon-sm" : "sm"}
              className={cn(
                compactBtn,
                "gap-1.5 border-destructive/25 bg-destructive/5 text-destructive hover:bg-destructive/10",
              )}
              title="Delete expense"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              {!compact && <span className="hidden tablet:inline">Delete</span>}
            </Button>
          </>
        )}
      </div>

      <ExpenseDetailsDialog
        expense={expense}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />

      {canManage && (
        <>
          <EditExpenseDialog
            expense={expense}
            open={editOpen}
            onOpenChange={setEditOpen}
          />

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove &quot;{expense.reason}&quot; from
                  your expense records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline" disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                >
                  {isDeleting && <Spinner className="size-4" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
}
