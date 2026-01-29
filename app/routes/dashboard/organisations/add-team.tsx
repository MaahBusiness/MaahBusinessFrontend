import { Avatar, AvatarImage, BoringFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import {
  Form,
  Link,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "react-router";
import type { OrganisationMember, Role, ServerActionState } from "types";
import { capitalizeFirstChar, genericErrorState } from "utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSession } from "@/lib/session.server";
import { Spinner } from "@/components/ui/spinner";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import RoleSelector from "@/components/role-selector";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import type { Route } from ".react-router/types/app/routes/dashboard/organisations/+types/add-team";
import { roles } from "@/routes/dashboard/team/data";
import { Badge } from "@/components/ui/badge";

export async function action({ request }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: OrganisationMember;
  }
> {
  const formData = await request.formData();
  const session = await getSession(request);

  const email = formData.get("email") as string | undefined;
  const role = formData.get("role") as Role | undefined;
  const id = formData.get("id") as string | undefined;

  const errors: Record<string, string> = {};

  if (!email) errors.email = "Please enter your email address.";
  if (!role) errors.role = "Please provide a role for the new member.";

  console.log("Adding...");
  if (Object.keys(errors).length > 0) return { success: false, errors };

  if (session?.accessToken)
    return await organisationsApi.addMemberByEmail(session.accessToken, id!, {
      name: email!,
      email: email!,
      role: role!,
    });

  return genericErrorState();
}

export default function AddTeam({ actionData }: Route.ComponentProps) {
  const { user, accessToken } = useAuth(); // Get token from context
  const [searchParams] = useSearchParams();

  // Access the client
  const queryClient = useQueryClient();
  const orgId = searchParams.get("id");
  const navigate = useNavigate();

  const navigation = useNavigation();
  const errors = actionData?.errors;
  const isSubmitting = navigation.state === "submitting";

  if (!orgId) throw navigate("organisations");

  //   Fetch organisation
  const { data: res, isLoading } = useQuery({
    queryKey: organisationKeys.core(orgId),
    queryFn: async () => {
      if (!accessToken) throw navigate(`/auth/signin`);
      return await organisationsApi.getById(accessToken, orgId);
    },
    enabled: !!accessToken, // Only run if token exists
  });

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.data) {
      // After creating/updating - refetch the list
      toast.success("New member has been created successfully.");
      queryClient.invalidateQueries({ queryKey: organisationKeys.core(orgId) });
    }
  }, [actionData]);

  if (isLoading) return <LoadingUI />;
  if (!res?.success) toast.error(genericErrorState().message);
  if (!res?.data) throw navigate("organisations");

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-3xl lg:px-6 px-0 mx-auto pt-12 pb-12">
      <div className="w-full flex flex-row items-center justify-between gap-6">
        <div className="">
          <h3 className="text-muted-foreground text-xs font-medium">
            Your organisation, {res.data?.name} has been created.
          </h3>
          <h1 className="text-2xl font-medium">Now let&apos;s add your team</h1>
        </div>{" "}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={"/dashboard/org/" + orgId}>
              <Button variant={"outline"}>Skip for now </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p className="w-36 text-center">
              You can invite team members anytime from organisation settings.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-12">
        <Form method="POST">
          <input type="hidden" name="intent" value="add-team" />
          <input type="hidden" name="id" value={orgId} />
          <FieldGroup className="gap-0 bg-card text-card-foreground flex flex-col rounded-xl border border-border py-2 shadow-sm">
            <Field className="flex-row gap-4 p-6">
              <div className=" flex flex-col gap-1">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="member@acme.com"
                  required
                />
                <FieldError errors={[{ message: errors?.email }]} />
                <FieldError errors={[{ message: errors?.role }]} />
              </div>
              <RoleSelector className="!w-auto" />
              <Button type="submit" disabled={isSubmitting} className="!w-auto">
                {isSubmitting && <Spinner />}Add member
              </Button>
            </Field>
          </FieldGroup>
        </Form>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl">Team Members</h2>

          <Card>
            <CardContent className="gap-2 flex flex-col">
              {res.data.members?.map((m) => {
                const role = roles.find((r) => r.id === m.role);
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between space-x-4"
                    id={m.id}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="size-6">
                        <AvatarImage src={m?.user?.avatar_url} />
                        <BoringFallback name={m?.user?.name} />
                      </Avatar>

                      <div className="text-sm flex items-center gap-2">
                        <span className="max-w-50 truncate">
                          {m.user?.name}
                        </span>
                        {m.user?.id === user?.id && (
                          <Badge
                            variant={"outline"}
                            className="text-muted-foreground text-xxs bg-muted"
                          >
                            You{" "}
                          </Badge>
                        )}
                        <span className="max-w-50 truncate text-muted-foreground">
                          {m.user?.email}
                        </span>
                      </div>
                    </div>
                    <Button size={"sm"} variant={"outline"} title={role?.desc}>
                      {capitalizeFirstChar(role?.label ?? "")}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="flex w-full items-center justify-end">
          <Link to={"/dashboard/org/" + orgId}>
            <Button>Continue to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingUI() {
  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-3xl lg:px-6 px-4 mx-auto pt-12">
      <div className="w-full">
        <h1 className="text-2xl font-medium">Now let&apos;s add your team</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-12 ">
            {[1, 2].map((idx) => (
              <Skeleton key={idx} className="h-20 w-full"></Skeleton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
