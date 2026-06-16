import { apiClient } from "@/lib/api-client";
import type { OrganisationCore, OrganisationMember, Role } from "types";
import {
  BUSINESS_URL,
  EDIT_MEMBERS_URL,
  LIST_MEMBERS_URL,
  MEMBERS_URL,
} from "utils/endpoints";

export const businessesApi = {
  getAll: (token: string) => apiClient.get<OrganisationCore[]>(BUSINESS_URL, token),
  getById: (token: string, id: string) =>
    apiClient.get<OrganisationCore>(BUSINESS_URL + id, token),
  create: (
    token: string,
    data: {
      name: string;
      email: string;
      description: string;
      address?: string;
      phone_number?: string;
      logo?: File | undefined;
      logo_url?: string;
    },
  ) => apiClient.post<OrganisationCore>(BUSINESS_URL, token, data),
  update: (
    token: string,
    id: string,
    data: {
      name: string;
      email: string;
      description: string;
      address?: string;
      phone_number?: string;
      logo_url?: string;
    },
  ) => apiClient.put<OrganisationCore>(BUSINESS_URL + id, token, data),
  delete: (token: string, id: string) => apiClient.delete<undefined>(BUSINESS_URL + id, token),
  getMembers: (token: string, id: string) =>
    apiClient.get<OrganisationMember[]>(BUSINESS_URL + id + LIST_MEMBERS_URL, token),
  addMember: (
    token: string,
    id: string,
    data: {
      name?: string;
      email: string;
      password?: string;
      role: Role;
    },
  ) => apiClient.post<OrganisationMember>(BUSINESS_URL + id + MEMBERS_URL, token, data),
  updateMember: (
    token: string,
    id: string,
    memberId: string,
    data: { is_active?: boolean; role?: Role },
  ) =>
    apiClient.post<OrganisationMember>(
      BUSINESS_URL + id + MEMBERS_URL + memberId + EDIT_MEMBERS_URL,
      token,
      data,
    ),
  removeMember: (token: string, id: string, memberId: string) =>
    apiClient.delete<undefined>(BUSINESS_URL + id + MEMBERS_URL + memberId, token),
};
