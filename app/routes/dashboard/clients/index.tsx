import type { Route } from ".react-router/types/app/routes/dashboard/clients/+types";
import { clientCols } from "@/components/clients/client-columns";
import { ClientTableToolbar } from "@/components/clients/client-table-toolbar";
import { AddClientDialog } from "@/components/clients/client-dialogs";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { ProductStatsGrid } from "@/components/products/product-stats-grid";
import { DataTable } from "@/components/ui/data-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationKeys } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  redirect,
  useNavigation,
  useParams,
  useSearchParams,
} from "react-router";
import { handleClientActions } from "services/api";
import { toast } from "sonner";
import type { Client, ClientFilters, ServerActionState } from "types";
import { clientFilterParsers, parseSearchParams } from "utils";
import { hasPermission } from "utils/permissions";
import { CreditCard, UserRound, Users } from "lucide-react";

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: Client;
  }
> {
  const { id } = params;
  if (!id) throw redirect("organisations");

  const formData = await request.formData();
  const session = await getSession(request);

  return await handleClientActions({ formData, id, session });
}

export default function ClientsPage({ actionData }: Route.ComponentProps) {
  const { fetchClients, businessMember } = useOrganisation();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const [searchParams] = useSearchParams();
  const navigation = useNavigation();

  const filters = parseSearchParams<ClientFilters>(
    searchParams,
    clientFilterParsers,
  );

  const { data: res, isLoading } = fetchClients(filters);
  const intent = navigation.formData?.get("intent");

  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id)
        queryClient.invalidateQueries({
          queryKey: organisationKeys.clientList(id, filters),
        });

      if (intent === "add-client")
        toast.success(`${actionData.data?.name} has been added succesfully!`);

      if (intent === "update-client")
        toast.success(`${actionData.data?.name} has been updated succesfully!`);
    }
  }, [actionData, filters, id, intent, queryClient]);

  const clients = res?.data ?? [];

  const statItems = useMemo(() => {
    const regular = clients.filter(
      (c) => c.customer_type?.toUpperCase() === "REGULAR",
    ).length;
    const wholesaler = clients.filter(
      (c) => c.customer_type?.toUpperCase() === "WHOLESALER",
    ).length;
    const repeatBuyers = clients.filter(
      (c) => Number(c.total_purchases || 0) > 0,
    ).length;

    return [
      {
        label: "Customers",
        value: String(res?.meta?.count ?? clients.length),
        accent: "emerald" as const,
        icon: Users,
        hint: "In current list",
      },
      {
        label: "Regular",
        value: String(regular),
        accent: "violet" as const,
        icon: UserRound,
        hint: "Individual buyers",
      },
      {
        label: "Wholesale",
        value: String(wholesaler),
        accent: "violet" as const,
        icon: Users,
        hint: "Business accounts",
      },
      {
        label: "Repeat buyers",
        value: String(repeatBuyers),
        accent: "orange" as const,
        icon: CreditCard,
        hint: "With purchase history",
      },
    ];
  }, [clients, res?.meta?.count]);

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed />;

  const canAddClient = hasPermission(businessMember?.role, "customers:crud");

  return (
    <div className="dashboard-page relative min-h-full overflow-x-hidden">
      <div aria-hidden className="dashboard-orb dashboard-orb-emerald" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />

      <div className="relative z-10 mx-auto w-full min-w-0 max-w-6xl px-3 py-4 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
        <div className="mb-5 min-w-0 space-y-4 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Customers
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage clients for sales, credits, and repeat business.
            </p>
          </div>

          <ProductStatsGrid items={statItems} />
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-emerald-500/15 bg-card/80 shadow-sm backdrop-blur-sm">
          {clients.length === 0 && !searchParams.toString() ? (
            <Empty className="border-0 bg-transparent py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UserRound className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No customers yet</EmptyTitle>
                <EmptyDescription className="max-w-sm text-pretty">
                  Add your first customer to attach them to invoices and track
                  credit balances.
                </EmptyDescription>
              </EmptyHeader>
              {canAddClient && <AddClientDialog />}
            </Empty>
          ) : (
            <DataTable
              data={clients}
              meta={res.meta}
              columns={clientCols}
              density="compact"
              DataTableToolbar={ClientTableToolbar}
            />
          )}
        </div>
      </div>
    </div>
  );
}
