import { Avatar, AvatarImage, BoringFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryHydration } from "@/components/layout/query-hydration";
import { useAuthErrorRedirect } from "@/hooks/use-auth-error-redirect";
import { useAuth } from "@/contexts/auth-context";
import { assertAccessToken } from "@/lib/auth-errors";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import {
  createAuthenticatedPrefetchLoader,
  prefetchOrgList,
} from "@/lib/query.server";
import { RequestFailed } from "@/routes/404";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import type { Route } from ".react-router/types/app/routes/dashboard/organisations/+types/home";
import {
  ArrowRight,
  Building2,
  Crown,
  Library,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { OrganisationCore } from "types";
import { extractImageUrl } from "utils";

const CARD_ACCENTS = [
  {
    gradient: "from-violet-600/25 via-violet-500/10 to-transparent",
    border: "border-violet-500/25 hover:border-violet-400/50",
    glow: "group-hover:shadow-violet-500/20",
    badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
  {
    gradient: "from-blue-600/25 via-cyan-500/10 to-transparent",
    border: "border-blue-500/25 hover:border-blue-400/50",
    glow: "group-hover:shadow-blue-500/20",
    badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  },
  {
    gradient: "from-emerald-600/25 via-green-500/10 to-transparent",
    border: "border-emerald-500/25 hover:border-emerald-400/50",
    glow: "group-hover:shadow-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  {
    gradient: "from-orange-600/25 via-amber-500/10 to-transparent",
    border: "border-orange-500/25 hover:border-orange-400/50",
    glow: "group-hover:shadow-orange-500/20",
    badge: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  },
] as const;

export async function loader({ request }: Route.LoaderArgs) {
  return createAuthenticatedPrefetchLoader(request, prefetchOrgList);
}

export default function Organisations({ loaderData }: Route.ComponentProps) {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const { data: res, isLoading, error } = useQuery({
    queryKey: organisationKeys.lists(),
    queryFn: async () => {
      assertAccessToken(accessToken, "/dashboard/organisations");
      return await organisationsApi.getAll(accessToken);
    },
    enabled: !!accessToken,
  });

  useAuthErrorRedirect(error, "/dashboard/organisations");

  const filtered = useMemo(() => {
    if (!res?.data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return res.data;
    return res.data.filter((org) => org.name.toLowerCase().includes(q));
  }, [res?.data, search]);

  if (isLoading) {
    return (
      <QueryHydration state={loaderData?.dehydratedState}>
        <OrganisationsSkeleton />
      </QueryHydration>
    );
  }
  if (!res?.success) {
    return (
      <QueryHydration state={loaderData?.dehydratedState}>
        <RequestFailed />
      </QueryHydration>
    );
  }
  if (!res.data?.length) {
    return (
      <QueryHydration state={loaderData?.dehydratedState}>
        <OrgsNotFound />
      </QueryHydration>
    );
  }

  return (
    <QueryHydration state={loaderData?.dehydratedState}>
    <div className="dashboard-page relative min-h-full">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />
      <div aria-hidden className="dashboard-orb dashboard-orb-emerald" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Hero */}
        <div className="dashboard-hero animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                <Sparkles className="size-3.5" />
                {res.data.length} workspace{res.data.length > 1 ? "s" : ""}
              </div>
              <h1 className="dashboard-hero-title text-3xl font-bold tracking-tight sm:text-4xl">
                Your organisations
              </h1>
              <p className="max-w-lg text-sm text-muted-foreground sm:text-base">
                Pick a business to manage inventory, sales, and your team — all
                in one place.
              </p>
            </div>

            <Link to="/dashboard/organisations/new" className="shrink-0">
              <Button
                size="lg"
                className="auth-submit-btn h-11 gap-2 border-0 px-5 shadow-lg"
              >
                <Plus className="size-4" />
                New organisation
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md animate-in fade-in duration-500 delay-100">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-violet-500/70" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organisations..."
            className="auth-input !pl-10"
          />
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org, idx) => (
            <OrgCard key={org.id} org={org} index={idx} />
          ))}
        </div>

        {filtered.length === 0 && search && (
          <p className="text-center text-sm text-muted-foreground">
            No organisation matches &ldquo;{search}&rdquo;
          </p>
        )}
      </div>
    </div>
    </QueryHydration>
  );
}

function OrgCard({ org, index }: { org: OrganisationCore; index: number }) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  return (
    <Link
      to={`/dashboard/org/${org.id}/home`}
      className={cn(
        "org-card group relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-card/60 p-5 backdrop-blur-sm transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        accent.border,
        accent.glow,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-100",
          accent.gradient,
        )}
      />

      <div className="relative flex items-start gap-4">
        <Avatar className="size-12 ring-2 ring-white/20 shadow-md">
          <AvatarImage
            src={extractImageUrl(org.logo_url ?? "") ?? undefined}
          />
          <BoringFallback name={org?.name} />
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate text-base font-semibold tracking-tight">
            {org.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" />
              {org.member_count} members
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                accent.badge,
              )}
            >
              <Crown className="size-2.5" />
              Owner
            </span>
          </div>
        </div>

        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-violet-500" />
      </div>

      <div className="relative flex items-center gap-2 text-xs text-muted-foreground">
        <Building2 className="size-3.5" />
        <span className="truncate">{org.email || "Retail workspace"}</span>
      </div>
    </Link>
  );
}

function OrganisationsSkeleton() {
  return (
    <div className="dashboard-page relative min-h-full">
      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-11 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrgsNotFound() {
  return (
    <div className="dashboard-page relative flex min-h-[calc(100svh-var(--header-height))] items-center justify-center">
      <div aria-hidden className="dashboard-orb dashboard-orb-violet" />
      <div aria-hidden className="dashboard-orb dashboard-orb-blue" />
      <Empty className="relative z-10 border-none bg-transparent">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10"
          >
            <Library className="text-violet-600 dark:text-violet-400" />
          </EmptyMedia>
          <EmptyTitle>No organisations yet</EmptyTitle>
          <EmptyDescription className="max-w-sm text-pretty">
            Create your first workspace to manage stock, sales, teams, and
            analytics.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link to="new">
            <Button size="lg" className="auth-submit-btn gap-2 border-0">
              <Plus className="size-4" />
              Create organisation
            </Button>
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
