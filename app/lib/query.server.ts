import {
  dehydrate,
  type DehydratedState,
  type QueryClient,
} from "@tanstack/react-query";
import { data, redirect } from "react-router";
import { dashboardApi, dashboardKeys } from "@/lib/api/dashboard";
import { financeApi, financeKeys } from "@/lib/api/finance";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { isOrgAccessDenied } from "@/lib/org-access";
import { makeQueryClient } from "@/lib/query-client";
import { requireUserSession } from "@/lib/session.server";
import type { DashboardDateFilters } from "@/lib/dashboard-types";
import type { ExpenseFilters } from "@/lib/finance-types";
import type { InvoiceFilters, ProductFilters, ServerActionState } from "types";

export type DehydratedLoaderData = {
  dehydratedState: DehydratedState | null;
};

type ResponseHeaders = Record<string, string> | undefined;

export async function prefetchOrgCoreData(
  queryClient: QueryClient,
  token: string,
  orgId: string,
) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: organisationKeys.core(orgId),
      queryFn: () => organisationsApi.getById(token, orgId),
    }),
    queryClient.prefetchQuery({
      queryKey: organisationKeys.members(orgId),
      queryFn: () => organisationsApi.getMembers(token, orgId),
    }),
  ]);
}

export async function prefetchOrgList(queryClient: QueryClient, token: string) {
  await queryClient.prefetchQuery({
    queryKey: organisationKeys.lists(),
    queryFn: () => organisationsApi.getAll(token),
  });
}

export async function prefetchExpenses(
  queryClient: QueryClient,
  token: string,
  orgId: string,
  filters?: ExpenseFilters,
) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: financeKeys.list(orgId, filters),
      queryFn: () => financeApi.listExpenses(token, orgId, filters),
    }),
    queryClient.prefetchQuery({
      queryKey: financeKeys.summary(orgId, {
        start_date: filters?.start_date,
        end_date: filters?.end_date,
      }),
      queryFn: () =>
        financeApi.getSummary(token, orgId, {
          start_date: filters?.start_date,
          end_date: filters?.end_date,
        }),
    }),
  ]);
}

export async function prefetchProducts(
  queryClient: QueryClient,
  token: string,
  orgId: string,
  filters?: ProductFilters,
) {
  await queryClient.prefetchQuery({
    queryKey: organisationKeys.prodlist(orgId, filters),
    queryFn: () => organisationsApi.getFilteredProducts(token, orgId, filters),
  });
}

export async function prefetchInvoices(
  queryClient: QueryClient,
  token: string,
  orgId: string,
  filters?: InvoiceFilters,
) {
  await queryClient.prefetchQuery({
    queryKey: organisationKeys.invoiceList(orgId, filters),
    queryFn: () => organisationsApi.getFilteredInvoices(token, orgId, filters),
  });
}

export async function prefetchDashboard(
  queryClient: QueryClient,
  token: string,
  orgId: string,
  filters?: DashboardDateFilters,
) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.summary(orgId, filters),
      queryFn: () => dashboardApi.getSummary(token, orgId, filters),
    }),
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.insights(orgId, filters),
      queryFn: () => dashboardApi.getInsights(token, orgId, filters),
    }),
  ]);
}

async function buildDehydratedResponse(
  prefetch: (queryClient: QueryClient, token: string) => Promise<void>,
  token: string,
  headers?: ResponseHeaders,
) {
  const queryClient = makeQueryClient();
  await prefetch(queryClient, token);

  return data<DehydratedLoaderData>(
    { dehydratedState: dehydrate(queryClient) },
    headers ? { headers } : undefined,
  );
}

export async function createAuthenticatedPrefetchLoader(
  request: Request,
  prefetch: (queryClient: QueryClient, token: string) => Promise<void>,
) {
  const { session, headers } = await requireUserSession(request);

  if (!session?.accessToken) {
    return data<DehydratedLoaderData>(
      { dehydratedState: null },
      headers ? { headers } : undefined,
    );
  }

  return buildDehydratedResponse(prefetch, session.accessToken, headers);
}

export async function createOrgPrefetchLoader(
  request: Request,
  orgId: string | undefined,
  prefetch: (
    queryClient: QueryClient,
    token: string,
    orgId: string,
  ) => Promise<void>,
) {
  const { session, headers } = await requireUserSession(request);

  if (!session?.accessToken || !orgId) {
    return data<DehydratedLoaderData>(
      { dehydratedState: null },
      headers ? { headers } : undefined,
    );
  }

  const queryClient = makeQueryClient();
  await prefetch(queryClient, session.accessToken, orgId);

  const core = queryClient.getQueryData<ServerActionState>(
    organisationKeys.core(orgId),
  );
  if (core && !core.success && isOrgAccessDenied(core.message)) {
    return redirect("/dashboard/organisations", headers ? { headers } : undefined);
  }

  return data<DehydratedLoaderData>(
    { dehydratedState: dehydrate(queryClient) },
    headers ? { headers } : undefined,
  );
}
