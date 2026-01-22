// ============================================================================
// CUSTOM HOOK - Single Organisation State Manager
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { redirect, useLocation, useParams } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { useEffect } from "react";

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

  // Fetch members
  const membersQuery = useQuery({
    queryKey: organisationKeys.members(orgId),
    queryFn: async () => {
      if (!accessToken) throw rdr;
      return await organisationsApi.getMembers(accessToken, orgId);
    },
    enabled: !!accessToken && !!coreQuery.data,
    // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
  });

  // Fetch members
  const customersQuery = useQuery({
    queryKey: organisationKeys.customers(orgId),
    queryFn: async () => {
      if (!accessToken) throw rdr;
      return await organisationsApi.getMembers(accessToken, orgId);
    },
    enabled: !!accessToken && !!coreQuery.data,
    // staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
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
        // Automatically refetch members
        queryClient.invalidateQueries({
          queryKey: organisationKeys.members(orgId),
        });
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
        // Automatically refetch members
        queryClient.invalidateQueries({
          queryKey: organisationKeys.members(orgId),
        });
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
        ? organisationsApi.deleteSubcategory(accessToken, orgId)
        : organisationsApi.deleteCategory(accessToken, orgId);
    },
    onSuccess: (res) => {
      if (res.success) {
        // Automatically refetch members
        queryClient.invalidateQueries({
          queryKey: organisationKeys.core(orgId),
        });
        toast.success("The category has been removed!");
      } else toast.error(res.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // You can handle custom success toast messages for fetchers on individual components since no success message is returned from the API (intentionally)

  useEffect(() => {
    if (coreQuery.data?.message) {
      if (!coreQuery.data?.success) toast.error(coreQuery.data?.message);
      // else toast.success(coreQuery.data?.message);
    }
  }, [coreQuery.data]);

  useEffect(() => {
    if (membersQuery.data?.message) {
      if (!membersQuery.data?.success) toast.error(membersQuery.data?.message);
      // else toast.success(membersQuery.data?.message);
    }
  }, [membersQuery.data]);

  return {
    // Data
    organisation: coreQuery.data,
    members: membersQuery.data,
    /**Special usage: User relative to current organisation */
    businessMember: membersQuery.data?.data?.find(
      (m) => m.user?.id === user?.id,
    ),

    // Loading states
    isLoading: coreQuery.isLoading,
    isLoadingMembers: membersQuery.isLoading,

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

    // Refetch functions
    refetchCore: coreQuery.refetch,
    refetchMembers: membersQuery.refetch,
  };
}
