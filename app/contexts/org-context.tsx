// contexts/auth-context.tsx
import { useAuth } from "@/contexts/auth-context";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { redirect, useLocation, useParams } from "react-router";
import type {
  OrganisationMember,
  OrganisationCore,
  ServerActionState,
} from "types";

type OrgContextType = {
  current?: OrganisationCore;
  /** Current user in context of current org */
  businessUser?: OrganisationMember;
  state?: ServerActionState;
  loading?: boolean;
  setOrganisation: (org: OrganisationCore) => Promise<void>;
  updateCurrent: ({ id }: { id?: string }) => Promise<void>;
};

const OrgContext = createContext<OrgContextType | undefined>(undefined);

interface OrgProviderProps {
  initial?: OrganisationCore;
  children: React.ReactNode;
}

export function OrgProvider({ children, initial }: OrgProviderProps) {
  const { user, accessToken } = useAuth();
  const { pathname } = useLocation();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setLoading] = useState(false);

  const [current, setCurrent] = useState<OrganisationCore>();
  const [businessUser, setUser] = useState<OrganisationMember>();
  const [resState, setResState] = useState<ServerActionState>();

  const setOrganisation = useCallback(
    async (org: OrganisationCore) => {
      setLoading(true);
      const _bUser = org.members?.find((m) => m.id === user?.id);

      if (!_bUser)
        throw new Error(
          "You must be a member of this organisation to access the dashboard",
        );

      setCurrent(org);
      setUser(_bUser);
      setLoading(false);
    },
    [user?.id],
  );

  // Initialize from cache if no initial has been provided
  const initData = useCallback(async () => {
    if (!id) throw redirect(`/dashboard/organisations`);
    console.log("INITIALIZING FROM INIT-DATA");
    setLoading(true);

    try {
      // Fetch organisations
      const { data: res, isLoading } = useQuery({
        queryKey: organisationKeys.lists(),
        queryFn: async () => {
          if (!accessToken)
            throw redirect(
              `/auth/signin?redirectTo=${encodeURIComponent(pathname)}`,
            );
          return await organisationsApi.getById(accessToken, id);
        },
        enabled: !!accessToken, // Only run if token exists
      });

      setLoading(isLoading);
      setResState(res);

      if (res?.data) {
        const _bUser = res.data.members?.find((m) => m.id === user?.id);

        if (!_bUser)
          throw new Error(
            "You must be a member of this organisation to access this page",
          );

        setCurrent(res.data);
        setUser(_bUser);
        setLoading(false);
      }
    } catch (error) {
      setResState({ success: false });
      setLoading(false);
      console.error("Failed to fetch org:", error);
    }
  }, [id, accessToken, pathname, user?.id]);

  // Update location by ID
  const updateCurrent = useCallback(
    async ({ id }: { id?: string }) => {
      if (!id) throw redirect(`/dashboard/organisations`);
      console.log("UPDATING CURRENT TO", id);
      setLoading(true);

      try {
        // Fetch organisations
        const { data: res, isLoading } = useQuery({
          queryKey: organisationKeys.detail(id),
          queryFn: async () => {
            if (!accessToken)
              throw redirect(
                `/auth/signin?redirectTo=${encodeURIComponent(pathname)}`,
              );
            return await organisationsApi.getById(accessToken, id);
          },
          enabled: !!accessToken, // Only run if token exists
        });

        setLoading(isLoading);
        setResState(res);

        if (res?.data) {
          const _bUser = res.data.members?.find((m) => m.id === user?.id);

          if (!_bUser)
            throw new Error(
              "You must be a member of this organisation to access this page",
            );

          setCurrent(res.data);
          setUser(_bUser);
          setLoading(false);
        }
      } catch (error) {
        setResState({ success: false });
        setLoading(false);
        console.error("Failed to fetch org:", error);
      }
    },
    [accessToken, pathname, user?.id],
  );

  // Initial setup
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      if (initial) console.log("INITIAL DATA PROVIDED");
      if (!initial) await initData();
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When you switch orgs, auto-feTCH DATA for new org
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      if (initial?.id !== id && current?.id !== id) await updateCurrent({ id });
    };

    initialize();
  }, [id, pathname]);

  const value: OrgContextType = {
    current,
    businessUser,
    loading: isLoading,
    state: resState,
    setOrganisation,
    updateCurrent,
  };

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
}
