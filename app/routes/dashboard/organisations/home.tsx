import type { Route } from ".react-router/types/app/routes/dashboard/organisations/+types/home";
import { Button } from "@/components/ui/button";
import { Item } from "@/components/ui/item";
import { useAuth } from "@/contexts/auth-context";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { requireUserSession } from "@/lib/session.server";
import EmptyOrganisationsState from "@/routes/dashboard/organisations/empty-orgs";
import LoadedOrganisationsState from "@/routes/dashboard/organisations/loaded-orgs";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { redirect } from "react-router";
import { genericErrorState } from "utils";

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
  // Access the client
  const queryClient = useQueryClient();

  // Fetch organisations
  const { data: res, isLoading } = useQuery({
    queryKey: organisationKeys.lists(),
    queryFn: async () => {
      if (!accessToken) throw redirect(`/auth/signin`);
      return await organisationsApi.getAll(accessToken);
    },
    enabled: !!accessToken, // Only run if token exists
  });

  if (isLoading) return <LoadingUI />;
  if (!res?.success) return <ErrorUI error={res?.message} />;
  if (!res.data) return <EmptyOrganisationsState />;

  return <LoadedOrganisationsState orgs={res.data} />;
}

function LoadingUI() {
  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto pt-12">
      <div className="w-full">
        <h1 className="text-2xl font-medium">Your organisations</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid auto-rows-min gap-4  md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Item
                key={i}
                variant="outline"
                className="bg-muted items-center gap-3 h-20 hover:bg-accent border-border animate-pulse"
                asChild
              >
                <div></div>
              </Item>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorUI({ error }: { error?: string }) {
  return (
    <div className="w-full min-h-full flex flex-col  gap-12 items-stretch max-w-[1200px] lg:px-6 px-4 mx-auto pt-12">
      <div className="w-full">
        <h1 className="text-2xl font-medium">Your organisations</h1>
      </div>

      <div className=" flex items-center justify-center p-4 mx-8">
        <div className="max-w-2xl w-full text-center space-y-4">
          <div className="relative">
            <h1 className="text-4xl font-bold leading-none select-none">
              Error loading
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <p className="text-muted-foreground max-w-md mx-auto">
              {genericErrorState().message}
            </p>
            {error && <pre className="text-xs opacity-70">{error}</pre>}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-primary/5 blur-2xl -z-10" />
          <div className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10" />
        </div>
      </div>
    </div>
  );
}
