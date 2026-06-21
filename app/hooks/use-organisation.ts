// ============================================================================
// CUSTOM HOOK - Single Organisation State Manager
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { redirect, useLocation, useParams } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { invalidateOrgDashboard } from "@/lib/api/dashboard";
import { invalidateOrgInventory } from "@/lib/api/inventory";
import { useEffect, useMemo } from "react";
import type {
  Barcode,
  ClientFilters,
  InvoiceFilters,
  PaymentFilters,
  ProductFilters,
} from "types";
import { normalizeRole } from "utils/permissions";

function syncOrgAnalytics(
  queryClient: QueryClient,
  orgId: string,
  opts?: { inventory?: boolean },
) {
  void invalidateOrgDashboard(queryClient, orgId);
  if (opts?.inventory !== false) void invalidateOrgInventory(queryClient, orgId);
}

export function useOrganisation() {
  const { id: orgId } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();

  const rdr = redirect(
    `/auth/signin?redirectTo=${encodeURIComponent(pathname)}`,
  );

  if (!orgId) {
    throw new Error("useOrganisation must be used within org routes");
  }

  // Fetch core data for single organisation
  const coreQuery = useQuery({
    queryKey: organisationKeys.core(orgId),
    queryFn: async () => {
      if (!accessToken) throw rdr;
      return await organisationsApi.getById(accessToken, orgId);
    },
    enabled: !!accessToken,
  });

  type QueryOpts = { enabled?: boolean };

  // Fetch members
  const membersQuery = (opts?: QueryOpts) =>
    useQuery({
      queryKey: organisationKeys.members(orgId),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getMembers(accessToken, orgId);
      },
      enabled: (opts?.enabled ?? true) && !!accessToken && !!coreQuery.data,
      // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });

  const productsQuery = (filters?: ProductFilters, opts?: QueryOpts) =>
    useQuery({
      queryKey: organisationKeys.prodlist(orgId, filters),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getFilteredProducts(
          accessToken,
          orgId,
          filters,
        );
      },
      enabled: (opts?.enabled ?? true) && !!accessToken && !!coreQuery.data,
      // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });

  const productQuery = (id: string) =>
    useQuery({
      queryKey: organisationKeys.product(id),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getProduct(accessToken, id);
      },
      enabled: !!accessToken && !!id,
    });

  const invoicesQuery = (filters?: InvoiceFilters, opts?: QueryOpts) =>
    useQuery({
      queryKey: organisationKeys.invoiceList(orgId, filters),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getFilteredInvoices(
          accessToken,
          orgId,
          filters,
        );
      },
      enabled: (opts?.enabled ?? true) && !!accessToken && !!coreQuery.data,
      // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });

  const invoiceArchivesQuery = (filters?: InvoiceFilters) =>
    useQuery({
      queryKey: organisationKeys.invoiceList(orgId + "archive", filters),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getFilteredArchivedInvoices(
          accessToken,
          orgId,
          filters,
        );
      },
      enabled: !!accessToken && !!coreQuery.data,
      // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });

  const paymentsQuery = (filters?: PaymentFilters) =>
    useQuery({
      queryKey: organisationKeys.paymentList(orgId, filters),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getFilteredPayments(
          accessToken,
          orgId,
          filters,
        );
      },
      enabled: !!accessToken && !!coreQuery.data,
      // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });

  const clientsQuery = (filters?: ClientFilters, opts?: QueryOpts) =>
    useQuery({
      queryKey: organisationKeys.clientList(orgId, filters),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getFilteredClients(
          accessToken,
          orgId,
          filters,
        );
      },
      enabled: (opts?.enabled ?? true) && !!accessToken && !!coreQuery.data,
      // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });

  const clientQuery = (id: string, opts?: QueryOpts) =>
    useQuery({
      queryKey: organisationKeys.client(id),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getSingleClient(accessToken, id);
      },
      enabled: (opts?.enabled ?? true) && !!accessToken && !!id,
    });

  const invoiceQuery = (id: string, opts?: QueryOpts) =>
    useQuery({
      queryKey: organisationKeys.invoice(id),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getSingleInvoice(accessToken, id);
      },
      enabled: (opts?.enabled ?? true) && !!accessToken && !!id && !!coreQuery.data,
      // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });

  const paymentQuery = (id: string) =>
    useQuery({
      queryKey: organisationKeys.payment(id),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getPayments(accessToken, id);
      },
      enabled: !!accessToken && !!coreQuery.data,
      // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });

  const invoicePaymentsQuery = (id: string) =>
    useQuery({
      queryKey: organisationKeys.paymentList(orgId, { invoice: id }),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.getInvoicePayments(accessToken, id);
      },
      enabled: !!accessToken && !!coreQuery.data,
      // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });

  // const receiptQuery = (id: string, format: "inline" | "attachment") =>
  //   useQuery({
  //     queryKey: organisationKeys.receipt(id),
  //     queryFn: async () => {
  //       if (!accessToken) throw rdr;
  //       return await organisationsApi.generateReceipt(accessToken, id, format);
  //     },
  //     enabled: !!accessToken && !!coreQuery.data,
  //     // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
  //   });

  const barcodeQuery = (code: string) =>
    useQuery({
      queryKey: organisationKeys.scanned(orgId, code),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.scanBarcode(accessToken, orgId, code);
      },
      enabled: false,
    });

  const printQuery = (id: string, format: "inline" | "attachment" = "inline") =>
    useQuery({
      queryKey: organisationKeys.print(id),
      queryFn: async () => {
        if (!accessToken) throw rdr;
        return await organisationsApi.generateReceipt(accessToken, id, format);
      },
      enabled: false,
    });

  // Update organisation mutation
  const updateOrganisation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      description: string;
      address?: string | undefined;
      phone_number?: string | undefined;
      logo_url?: string | undefined;
    }) => {
      if (!accessToken) throw rdr;
      return organisationsApi.update(accessToken, orgId, data);
    },
    onSuccess: (response) => {
      // Update cache with new data
      if (response.success) {
        queryClient.setQueryData(organisationKeys.core(orgId), response.data);
        toast.success("Organisation details updated successfully");
      } else toast.error(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Add member mutation
  const addMember = useMutation({
    mutationFn: async (data: { user_id: string; role: string }) => {
      if (!accessToken) throw rdr;
      return organisationsApi.addMember(accessToken, orgId, data);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.members(orgId),
        });
        syncOrgAnalytics(queryClient, orgId, { inventory: false });
        toast.success("Member added!");
      } else toast.error(res.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Remove member mutation
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      if (!accessToken) throw rdr;
      return organisationsApi.removeMember(accessToken, orgId, memberId);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.members(orgId),
        });
        syncOrgAnalytics(queryClient, orgId, { inventory: false });
        toast.success("Team member has been removed!");
      } else toast.error(res.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeCategory = useMutation({
    mutationFn: async (data: { id: string; sub?: boolean }) => {
      if (!accessToken) throw rdr;
      return data.sub
        ? organisationsApi.deleteSubcategory(accessToken, data.id)
        : organisationsApi.deleteCategory(accessToken, data.id);
    },
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.core(orgId),
        });
        syncOrgAnalytics(queryClient, orgId);
        toast.success(
          variables.sub
            ? "Subcategory deleted successfully!"
            : "Category deleted successfully!",
        );
      } else toast.error(res.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeProduct = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw rdr;
      return organisationsApi.removeProduct(accessToken, id);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.prodlist(orgId),
        });
        queryClient.invalidateQueries({
          queryKey: organisationKeys.product(res.data?.id ?? ""),
        });
        syncOrgAnalytics(queryClient, orgId);
        toast.success(res.message ?? "Product removed successfully.");
      } else toast.error(res.message ?? "Could not remove product.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeClient = useMutation({
    mutationFn: async (clientId: string) => {
      if (!accessToken) throw rdr;
      return organisationsApi.removeClient(accessToken, clientId);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.clientList(orgId),
        });
        syncOrgAnalytics(queryClient, orgId, { inventory: false });
        toast.success(res.message ?? "Customer removed successfully.");
      } else toast.error(res.message ?? "Could not remove customer.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const removeinvoice = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw rdr;
      return organisationsApi.deleteInvoice(accessToken, id);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoiceList(orgId),
        });
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoice(res.data?.id ?? ""),
        });
        syncOrgAnalytics(queryClient, orgId);
        toast.success("The invoice has been removed successfully!");
      } else toast.error(res.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const archiveInvoice = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw rdr;
      return organisationsApi.archiveInvoice(accessToken, id);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoiceList(orgId),
        });
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoices(orgId),
        });
        syncOrgAnalytics(queryClient, orgId);
        toast.success("The invoice has been archived successfully!");
      } else toast.error(res.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const unArchiveInvoice = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw rdr;
      return organisationsApi.updateInvoice(accessToken, id, {
        is_archived: false,
      });
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoiceList(orgId),
        });
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoice(res.data?.id ?? ""),
        });
        syncOrgAnalytics(queryClient, orgId);
        toast.success("The invoice has been removed from archives!");
      } else toast.error(res.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const cancelInvoice = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw rdr;
      return organisationsApi.cancelInvoice(accessToken, id);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoiceList(orgId),
        });
        queryClient.invalidateQueries({
          queryKey: organisationKeys.invoice(res.data?.id ?? ""),
        });
        syncOrgAnalytics(queryClient, orgId);
        toast.success("The invoice has been canceled successfully!");
      } else toast.error(res.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Remove organisation mutation
  const removeOrganisation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw rdr;
      return organisationsApi.delete(accessToken, orgId);
    },
    onSuccess: (response) => {
      // Update cache with new data
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.core(orgId),
        });
        queryClient.invalidateQueries({
          queryKey: organisationKeys.lists(),
        });
        toast.success("Organisation has been permanently deleted.");
        redirect("/dashboard/organisations");
      } else toast.error(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // You can handle custom success toast messages for fetchers on individual components since no success message is returned from the API (intentionally)

  const { data: membersListRes, isLoading: isMembersLoading } = membersQuery();

  const businessMember = useMemo(() => {
    const org = coreQuery.data?.data;
    const embedded = org?.members ?? [];
    const listed = membersListRes?.data ?? [];
    const pool = embedded.length ? embedded : listed;

    const match = pool.find((m) => m.user?.id === user?.id);
    if (match) {
      return { ...match, role: normalizeRole(match.role) ?? match.role };
    }

    // Members list can be empty while the user is still the business owner
    if (user?.id && org?.owner_id === user.id) {
      return (
        pool.find((m) => m.role === "owner") ?? {
          id: org.owner_id,
          role: "owner" as const,
          is_active: true,
          joined_at: org.created_at,
          created_at: org.created_at,
          updated_at: org.updated_at,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            is_active: true,
          },
        }
      );
    }

    return undefined;
  }, [coreQuery.data?.data, membersListRes?.data, user?.id, user?.email, user?.name]);

  useEffect(() => {
    if (coreQuery.data?.message) {
      if (!coreQuery.data?.success) toast.error(coreQuery.data?.message);
      // else toast.success(coreQuery.data?.message);
    }
  }, [coreQuery.data]);

  return {
    // Data
    organisation: coreQuery.data,
    /** Current user's membership in this organisation */
    businessMember,

    fetchMembers: membersQuery,
    fetchProducts: productsQuery,
    fetchSingleProduct: productQuery,

    fetchInvoices: invoicesQuery,
    fetchSingleInvoice: invoiceQuery,
    fetchArchivedInvoices: invoiceArchivesQuery,
    fetchPayments: paymentsQuery,
    fetchInvoicePayments: invoicePaymentsQuery,
    fetchSinglePayment: paymentQuery,
    fetchClients: clientsQuery,
    fetchSingleClient: clientQuery,

    // Loading states
    isLoading: coreQuery.isLoading,
    isMembersLoading,

    // Error states
    error: coreQuery.error,

    // Mutations
    updateOrganisation: updateOrganisation.mutate,
    isUpdating: updateOrganisation.isPending,

    addMember: addMember.mutate,
    isAddingMember: addMember.isPending,
    addMemberState: addMember.status,

    removeMember: removeMember.mutate,
    isRemovingMember: removeMember.isPending,
    removeMemberState: removeMember.data,

    removeCategory: removeCategory.mutate,
    isRemovingCategory: removeCategory.isPending,
    removeCategoryState: removeCategory.data,

    removeProduct: removeProduct.mutate,
    isRemovingProduct: removeProduct.isPending,
    removeProductState: removeProduct.data,

    removeClient: removeClient.mutate,
    isRemovingClient: removeClient.isPending,
    removeClientState: removeClient.data,

    scanCode: barcodeQuery,
    generateReceipt: printQuery,

    removeinvoice: removeinvoice.mutate,
    isRemovinginvoice: removeinvoice.isPending,
    removeinvoiceState: removeinvoice.data,

    archiveInvoice: archiveInvoice.mutate,
    isArchivingInvoice: archiveInvoice.isPending,
    archiveInvoiceState: archiveInvoice.data,

    unArchiveInvoice: unArchiveInvoice.mutate,
    isunArchivingInvoice: unArchiveInvoice.isPending,
    unArchiveInvoiceState: unArchiveInvoice.data,

    cancelInvoice: cancelInvoice.mutate,
    isCancellingInvoice: cancelInvoice.isPending,
    cancelInvoiceState: cancelInvoice.data,

    // Refetch functions
    refetchCore: coreQuery.refetch,

    // Destructive
    remove: removeOrganisation.mutate,
    isRemoving: removeOrganisation.isPending,
  };
}
