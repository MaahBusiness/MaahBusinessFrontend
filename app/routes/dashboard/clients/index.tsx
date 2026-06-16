import type { Route } from ".react-router/types/app/routes/dashboard/clients/+types";
import { clientCols } from "@/components/clients/client-columns";
import { ClientTableToolbar } from "@/components/clients/client-table-toolbar";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { DataTable } from "@/components/ui/data-table";
import { useOrganisation } from "@/hooks/use-organisation";
import { organisationKeys } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { mockClients } from "@/routes/dashboard/clients/data";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function InvoicesPage({ actionData }: Route.ComponentProps) {
  const { fetchClients } = useOrganisation();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const [searchParams] = useSearchParams();
  const navigation = useNavigation();

  // const [filters, setFilters] = useState<InvoiceFilters>();

  const filters = parseSearchParams<ClientFilters>(
    searchParams,
    clientFilterParsers,
  );

  const { data: res, isLoading } = fetchClients(filters);
  const intent = navigation.formData?.get("intent");

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id)
        // Automatically refetch products
        queryClient.invalidateQueries({
          queryKey: organisationKeys.clientList(id, filters),
        });

      if (intent === "add-client")
        toast.success(`${actionData.data?.name} has been added succesfully!`);

      if (intent === "update-client")
        toast.success(`${actionData.data?.name} has been updated succesfully!`);
    }
  }, [actionData]);

  if (isLoading) return <DataTableSkeleton />;
  if (!res?.success) return <RequestFailed />;

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <h2 className="text-lg tracking-tight">Clients</h2>
      </div>

      <DataTable
        data={res.data ?? []}
        // data={mockClients}
        meta={res.meta}
        columns={clientCols}
        DataTableToolbar={ClientTableToolbar}
      />
    </div>
  );
}
