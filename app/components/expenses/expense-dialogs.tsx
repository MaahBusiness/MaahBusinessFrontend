import { useEffect, useMemo, useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCloseOnActionSuccess } from "@/hooks/use-close-on-action-success";
import { useExpenseHistory } from "@/hooks/use-expenses";
import { useOrganisation } from "@/hooks/use-organisation";
import type { Expense } from "@/lib/finance-types";
import type {
  ExpensePayeeType,
  ExpensePaymentMethod,
  ExpenseType,
} from "@/lib/finance-types";
import {
  EXPENSE_TYPE_LABELS,
  PAYEE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  expenseTypes,
  payeeTypes,
  paymentMethods,
} from "@/routes/dashboard/expenses/data";
import { Form, useNavigation } from "react-router";
import { Plus, Wallet } from "lucide-react";
import { formatDisplayAmount, capitalizeFirstChar } from "utils";
import { roles } from "@/routes/dashboard/team/data";

function ExpenseFormFields({ expense }: { expense?: Expense }) {
  const { fetchMembers } = useOrganisation();
  const { data: membersRes, isLoading: membersLoading } = fetchMembers();

  const [expenseType, setExpenseType] = useState<ExpenseType>(
    expense?.expense_type ?? "MISCELLANEOUS",
  );
  const [payeeType, setPayeeType] = useState<ExpensePayeeType>(
    expense?.payee_type ?? "OTHER",
  );
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod>(
    expense?.payment_method ?? "CASH",
  );
  const [payeeName, setPayeeName] = useState(expense?.payee_name ?? "");
  const [employeeId, setEmployeeId] = useState(
    (expense?.justification_metadata?.employee_id as string | undefined) ?? "",
  );

  const employees = useMemo(
    () =>
      (membersRes?.data ?? []).filter(
        (member) => member.is_active && member.user?.id,
      ),
    [membersRes?.data],
  );

  useEffect(() => {
    if (expenseType === "SALARY") {
      setPayeeType("EMPLOYEE");
    }
  }, [expenseType]);

  const handleEmployeeChange = (userId: string) => {
    setEmployeeId(userId);
    const member = employees.find((m) => m.user?.id === userId);
    const label =
      member?.user?.name?.trim() ||
      member?.user?.email ||
      "";
    if (label) setPayeeName(label);
  };

  return (
    <div className="grid gap-4 py-2">
      <input type="hidden" name="expense_type" value={expenseType} />
      <input type="hidden" name="payee_type" value={payeeType} />
      <input type="hidden" name="payment_method" value={paymentMethod} />
      {employeeId && expenseType === "SALARY" && (
        <input type="hidden" name="employee_id" value={employeeId} />
      )}
      {expense?.id && <input type="hidden" name="id" value={expense.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Type</FieldLabel>
          <Select
            value={expenseType}
            onValueChange={(v) => setExpenseType(v as ExpenseType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {expenseTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="amount">Amount</FieldLabel>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="50000"
            defaultValue={expense ? Number(expense.amount) : undefined}
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="reason">Reason</FieldLabel>
        <Input
          id="reason"
          name="reason"
          required
          placeholder="Monthly electricity bill"
          defaultValue={expense?.reason}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="reason_details">Details</FieldLabel>
        <Textarea
          id="reason_details"
          name="reason_details"
          required
          rows={3}
          placeholder="Additional context about this expense"
          defaultValue={expense?.reason_details}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="payee_name">Payee name</FieldLabel>
          <Input
            id="payee_name"
            name="payee_name"
            required
            placeholder="Vendor or recipient"
            value={payeeName}
            onChange={(e) => setPayeeName(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>Payee type</FieldLabel>
          <Select
            value={payeeType}
            onValueChange={(v) => setPayeeType(v as ExpensePayeeType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select payee type" />
            </SelectTrigger>
            <SelectContent>
              {payeeTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>Payment method</FieldLabel>
          <Select
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as ExpensePaymentMethod)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="payment_reference">Reference (optional)</FieldLabel>
          <Input
            id="payment_reference"
            name="payment_reference"
            placeholder="Transaction ID, check #…"
            defaultValue={expense?.payment_reference || undefined}
          />
        </Field>
      </div>

      {expenseType === "SALARY" && (
        <Field>
          <FieldLabel>Employee</FieldLabel>
          {membersLoading ? (
            <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              Loading team members…
            </div>
          ) : employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active team members found. Add members in Team first.
            </p>
          ) : (
            <Select
              value={employeeId || undefined}
              onValueChange={handleEmployeeChange}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((member) => {
                  const user = member.user!;
                  const roleLabel =
                    roles.find((r) => r.id === member.role)?.label ??
                    capitalizeFirstChar(member.role.replace(/_/g, " "));
                  return (
                    <SelectItem key={user.id} value={user.id}>
                      {`${user.name?.trim() || user.email} · ${roleLabel}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-muted-foreground">
            Required for salary expenses. Payee name is filled automatically.
          </p>
        </Field>
      )}
    </div>
  );
}

function ExpenseFormDialog({
  expense,
  intent,
  title,
  description,
  triggerLabel,
  open,
  onOpenChange,
}: {
  expense?: Expense;
  intent: "add-expense" | "update-expense";
  title: string;
  description: string;
  triggerLabel?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const navigation = useNavigation();
  const isSubmitting =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === intent;

  useCloseOnActionSuccess(
    open ?? false,
    () => onOpenChange?.(false),
    intent,
  );

  const form = (
    <Form method="post" className="flex flex-col">
      <input type="hidden" name="intent" value={intent} />
      <div className="px-6">
        <ExpenseFormFields expense={expense} />
      </div>
      <DialogFooter className="border-t px-6 py-4">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="size-4" />}
          {intent === "add-expense" ? "Add expense" : "Save changes"}
        </Button>
      </DialogFooter>
    </Form>
  );

  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          {triggerLabel ?? "Add expense"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}

export function AddExpenseDialog() {
  return (
    <ExpenseFormDialog
      intent="add-expense"
      title="Record expense"
      description="Log a business expense with payment and payee details."
      triggerLabel="Add expense"
    />
  );
}

export function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
}: {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ExpenseFormDialog
      expense={expense}
      intent="update-expense"
      title="Edit expense"
      description="Update expense details. Approval status is managed separately."
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

export function ExpenseDetailsDialog({
  expense,
  open,
  onOpenChange,
}: {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: historyRes, isLoading: historyLoading } = useExpenseHistory(
    expense.id,
    open,
  );
  const history = historyRes?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-5 text-orange-600" />
            {expense.reason}
          </DialogTitle>
          <DialogDescription>{expense.reason_details}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Amount", value: formatDisplayAmount(expense.amount) },
            { label: "Type", value: EXPENSE_TYPE_LABELS[expense.expense_type] },
            { label: "Payee", value: expense.payee_name },
            {
              label: "Payee type",
              value: PAYEE_TYPE_LABELS[expense.payee_type],
            },
            {
              label: "Payment",
              value: PAYMENT_METHOD_LABELS[expense.payment_method],
            },
            {
              label: "Status",
              value: expense.is_approved ? "Approved" : "Pending approval",
            },
            {
              label: "Recorded by",
              value: expense.user_name || expense.user_id.slice(0, 8),
            },
            {
              label: "Date",
              value: format(parseISO(expense.created_at), "PPp"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border/50 bg-muted/20 p-3"
            >
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        {expense.payment_reference && (
          <p className="text-sm text-muted-foreground">
            Reference: {expense.payment_reference}
          </p>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Audit history</p>
            <Badge variant="outline">{history.length} entries</Badge>
          </div>
          {historyLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Loading history…
            </p>
          ) : history.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No audit entries yet.
            </p>
          ) : (
            <div className="max-h-48 overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        {log.amount_after
                          ? formatDisplayAmount(log.amount_after)
                          : log.amount_before
                            ? formatDisplayAmount(log.amount_before)
                            : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(parseISO(log.created_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
