import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { Form, redirect, useNavigation, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import type {
  OrganisationMember,
  OrganisationCore,
  Role,
  ServerActionState,
} from "types";
import { capitalizeFirstChar, genericErrorState } from "utils";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Item } from "@/components/ui/item";
import { toast } from "sonner";
import type { Route } from ".react-router/types/app/routes/dashboard/organisations/+types/add-team";
import { getSession } from "@/lib/session.server";
import { Spinner } from "@/components/ui/spinner";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";

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
  if (!role) errors.desc = "Please provide a role for the new member.";

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

  const navigation = useNavigation();
  const errors = actionData?.errors;
  const isSubmitting = navigation.state === "submitting";

  if (!orgId) throw redirect("organisations");

  //   Fetch organisation
  const { data: res, isLoading } = useQuery({
    queryKey: organisationKeys.core(orgId),
    queryFn: async () => {
      if (!accessToken) throw redirect(`/auth/signin`);
      return await organisationsApi.getById(accessToken, orgId);
    },
    enabled: !!accessToken, // Only run if token exists
  });

  useEffect(() => {
    if (actionData?.data) {
      // After creating/updating - refetch the list
      toast.success("Your organisation has been created successfully.");
      queryClient.invalidateQueries({
        queryKey: organisationKeys.core(orgId),
      });
      queryClient.setQueryData(
        organisationKeys.members(orgId),
        actionData.data,
      );
      redirect(`orgs/${orgId}`);
    }
  }, [actionData]);

  if (isLoading) return <LoadingUI />;
  if (!res?.success) toast.error(genericErrorState().message);
  if (!res?.data) throw redirect("organisations");

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-3xl lg:px-6 px-0 mx-auto pt-12 pb-12">
      <div className="w-full flex flex-row items-center justify-between gap-6">
        <div className="">
          <h3 className="text-muted-foreground text-xs font-medium">
            Your organisation has been created. {orgId}
          </h3>
          <h1 className="text-2xl font-medium">Now let's add your team</h1>
          <h2 className="text-muted-foreground text-sm font-medium">
            Get everyone set up so you can start working together.{" "}
          </h2>
        </div>{" "}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant={"outline"}>Skip for now </Button>
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
              <div className="">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="member@acme.com"
                  required
                />
                {/* <FieldError errors={[{ message: errors?.name }]} /> */}
              </div>
              <RoleSelector />
              <Button type="submit" disabled={isSubmitting} className="!w-auto">
                {isSubmitting && <Spinner />}Create organisation
              </Button>
            </Field>
            <FieldError errors={[{ message: errors?.email }]} />
            <FieldError errors={[{ message: errors?.role }]} />
          </FieldGroup>
        </Form>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl">Team Members</h2>

          <Card>
            <CardContent>
              {res.data.members?.map((m) => (
                <div
                  className="flex items-center justify-between space-x-4"
                  id={m.id}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="size-10">
                      <AvatarImage src={m?.user?.avatar_url} />
                      <AvatarFallback name={m?.user?.name} />
                    </Avatar>

                    <div>
                      <p className="text-sm font-medium leading-none">
                        {m.user?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {m.user?.email}
                      </p>
                    </div>
                  </div>
                  <RoleSelector value={m.role} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/avatars/03.png" />
                      <AvatarFallback>OM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        Olivia Martin
                      </p>
                      <p className="text-sm text-muted-foreground">
                        m@example.com
                      </p>
                    </div>
                  </div>
                  <Select defaultValue="edit">
                    <SelectTrigger className="ml-auto w-[110px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edit">Can edit</SelectItem>
                      <SelectItem value="view">Can view</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/avatars/05.png" />
                      <AvatarFallback>IN</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        Isabella Nguyen
                      </p>
                      <p className="text-sm text-muted-foreground">
                        b@example.com
                      </p>
                    </div>
                  </div>
                  <Select defaultValue="view">
                    <SelectTrigger className="ml-auto w-[110px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edit">Can edit</SelectItem>
                      <SelectItem value="view">Can view</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/avatars/01.png" />
                      <AvatarFallback />
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        Sofia Davis
                      </p>
                      <p className="text-sm text-muted-foreground">
                        p@example.com
                      </p>
                    </div>
                  </div>
                  <Select defaultValue="view">
                    <SelectTrigger className="ml-auto w-[110px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edit">Can edit</SelectItem>
                      <SelectItem value="view">Can view</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Field className="grid gap-4 sm:grid-cols-2">
          <Button variant={"outline"}>Skip </Button>
          <Button type="submit" disabled={false}>
            {/* {isSubmitting && <Spinner />} */}
            Create organisation
          </Button>
        </Field>
      </div>
    </div>
  );
}

function LoadingUI() {
  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-3xl lg:px-6 px-4 mx-auto pt-12">
      <div className="w-full">
        <h1 className="text-2xl font-medium">Now let's add your team</h1>
        <h2 className="text-muted-foreground text-sm font-medium">
          Get everyone set up so you can start working together.{" "}
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-12 ">
            {[1, 2].map(() => (
              <Item
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

const roles: {
  id: Role;
  label: string;
  desc?: string;
}[] = [
  { id: "cashier", label: "Cashier", desc: "Can view and comment." },
  {
    id: "stock_keeper",
    label: "Stock Keeper",
    desc: "Can view, comment and edit.",
  },
  {
    id: "manager",
    label: "Manager",
    desc: "Can view, comment and manage billing.",
  },
  //   { id: "owner", label: "Owner", desc: "Admin-level access to all resources." },
];

function RoleSelector({
  value,
  disabled,
}: {
  value?: Role;
  disabled?: boolean;
}) {
  const [role, setRole] = useState<(typeof roles)[0]>(
    roles.find((r) => r.id === value) || roles[0],
  );
  const isOwner = value === "owner";

  return (
    <Popover>
      <input type="hidden" name="role" value={role.id} />

      <PopoverTrigger disabled={disabled} asChild>
        <Button variant="outline" className="!w-auto bg-card">
          {capitalizeFirstChar(role.label)}
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <Command>
          <CommandInput placeholder="Select new role..." />
          <CommandList>
            <CommandEmpty>No roles found.</CommandEmpty>
            <CommandGroup>
              {roles.map((r) => (
                <CommandItem
                  id={r.id}
                  onSelect={() => setRole(r)}
                  disabled={isOwner}
                  value={r.id}
                  className={"teamaspace-y-1 px-4 py-2"}
                >
                  <div className="flex flex-col items-start ">
                    <p>{r.label}</p>
                    <p className="text-sm text-muted-foreground">{r.desc}</p>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      r?.id === role.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
              <CommandItem
                disabled={!isOwner}
                className="teamaspace-y-1 flex flex-col items-start px-4 py-2"
              >
                <p>Owner</p>
                <p className="text-sm text-muted-foreground">
                  Admin-level access to all resources.
                </p>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
