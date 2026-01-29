import type { Route } from ".react-router/types/app/routes/dashboard/organisations/+types/home";
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
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { requireUserSession } from "@/lib/session.server";
import { RequestFailed } from "@/routes/404";
import { useQuery } from "@tanstack/react-query";
import { Library, Plus, PlusIcon, SearchIcon } from "lucide-react";
import { Link, redirect } from "react-router";

// ------------------------------
// Loader - only handles auth now since Tanstack added
// ------------------------------
export async function loader({ request }: Route.LoaderArgs) {
  const { session, headers } = await requireUserSession(request);

  if (!session) {
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;

    return redirect(
      `/auth/signin?redirectTo=${encodeURIComponent(redirectTo)}`,
      { headers },
    );
  }

  return { session, headers };
}

export default function Organisations() {
  const { accessToken } = useAuth(); // Get token from context

  // Fetch organisations
  const { data: res, isLoading } = useQuery({
    queryKey: organisationKeys.lists(),
    queryFn: async () => {
      if (!accessToken) throw redirect(`/auth/signin`);
      return await organisationsApi.getAll(accessToken);
    },
    enabled: !!accessToken, // Only run if token exists
  });

  if (isLoading) return <OrganisationsSkeleton />;
  if (!res?.success) return <RequestFailed />;
  if (!res.data) return <OrgsNotFound />;

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto pt-12">
      <div className="w-full">
        <h1 className="text-2xl font-medium">Your organisations</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <InputGroup className="w-auto focus-visible:!ring-0">
            <InputGroupInput placeholder="Search organisations..." />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <Link to={"/dashboard/organisations/new"}>
            <Button size="sm">
              <PlusIcon /> New organisation
            </Button>
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="grid auto-rows-min gap-4  md:grid-cols-3">
            {res.data.map((org, idx) => (
              <Item
                key={idx}
                variant="outline"
                className="bg-input/50 items-center gap-3 hover:bg-accent border-border"
                asChild
              >
                <Link to={`/dashboard/org/${org.id}`}>
                  <ItemMedia>
                    <Avatar className="size-10">
                      <AvatarImage src={org.logo_url} />
                      <BoringFallback name={org?.name} />
                    </Avatar>
                  </ItemMedia>
                  <ItemContent className="gap-0">
                    <ItemTitle>{org.name}</ItemTitle>
                    <ItemDescription className="text-xxs flex gap-1.5">
                      <span>{org.member_count} members</span>
                      <span>·</span>
                      <span>Owner</span>
                    </ItemDescription>
                  </ItemContent>
                </Link>
              </Item>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrganisationsSkeleton() {
  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto py-12">
      <div className="w-full flex items-center gap-2">
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="flex flex-col gap-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Skeleton className="h-8 w-[200px] lg:w-[250px]" />
          </div>

          <div className="flex items-center space-x-2">
            <Button>
              <Skeleton className="h-2 w-12" />
            </Button>
          </div>
        </div>

        {/* Orgs */}
        <div className="grid auto-rows-min gap-4  md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <Skeleton className="h-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrgsNotFound() {
  return (
    <Empty className="p-0 !h-[calc(100svh-var(--header-height))]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Library />
        </EmptyMedia>
        <EmptyTitle>
          Looks like you aren't part of any organisations yet
        </EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          Organisations help you manage teams, projects, finances, and
          performance — all in one place.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to={"new"}>
          <Button>
            <Plus />
            Create Organisation
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}
