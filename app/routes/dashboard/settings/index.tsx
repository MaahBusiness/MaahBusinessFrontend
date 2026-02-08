import type { Route } from ".react-router/types/app/routes/dashboard/settings/+types";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import FileUploadInput from "@/components/ui/file-upload-input";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
} from "react-router";
import { Button } from "@/components/ui/button";
import { useOrganisation } from "@/hooks/use-organisation";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestFailed } from "@/routes/404";
import { hasPermission } from "utils/permissions";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import { ShieldAlertIcon, Trash, Trash2, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { extractImageUrl, genericErrorState } from "utils";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { getSession } from "@/lib/session.server";
import type { OrganisationCore, ServerActionState } from "types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

export async function action({ request, params }: Route.ActionArgs): Promise<
  ServerActionState & {
    data?: OrganisationCore;
  }
> {
  const { id } = params;
  if (!id) throw redirect("dashboard/organisations");

  const formData = await request.formData();
  const session = await getSession(request);
  const intent = formData.get("intent");

  const name = formData.get("name") as string | undefined;
  const desc = formData.get("desc") as string | undefined;
  const email = formData.get("email") as string | undefined;
  const phone = formData.get("phone") as string | undefined;
  const address = formData.get("address") as string | undefined;
  const pfp = formData.get("pfp") as File | undefined;
  const url = formData.get("url") as string | undefined;

  const errors: Record<string, string> = {};

  switch (intent) {
    case "update-org": {
      if (!name) errors.name = "Please enter your name.";
      if (!email) errors.email = "Please enter your email address.";
      if (!desc)
        errors.desc = "Please provide a description for your organisation.";

      if (Object.keys(errors).length > 0) return { success: false, errors };

      if (session?.accessToken)
        return await organisationsApi.update(session.accessToken, id, {
          name: name!,
          email: email!,
          description: desc!,
          address,
          phone_number: phone,
          logo_url: url,
        });
    }

    default:
      return genericErrorState();
  }
  return genericErrorState();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SettingsPage({ actionData }: Route.ComponentProps) {
  const {
    organisation: res,
    isLoading,
    error,
    refetchCore,
    businessMember,
    remove,
    isRemoving,
  } = useOrganisation();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const errors = actionData?.errors;
  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      if (id) {
        queryClient.invalidateQueries({
          queryKey: organisationKeys.core(id),
        });
        queryClient.invalidateQueries({
          queryKey: organisationKeys.lists(),
        });
        if (intent === "update-org")
          toast.success("Your organisation has been updated successfully!");
      }
    }
  }, [actionData]);

  if (isLoading || !res?.success) return <SettingsLoadingUI />;

  if (res && !res?.success) return <RequestFailed refetch={refetchCore} />;
  if (!hasPermission(businessMember?.role, "business:manage"))
    return <RequestFailed />;

  const { data } = res;

  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-3xl lg:px-6 px-6 mx-auto py-12">
      <div className="w-full">
        <h1 className="text-lg font-medium">Organisation Settings</h1>
        {/* <h2 className="text-muted-foreground text-sm font-medium">
          Configure general options, domains, transfers, and project lifecycle.
        </h2> */}
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security" disabled>
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Notifications
          </TabsTrigger>
          <TabsTrigger value="legal" disabled>
            Legal
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="general"
          className="flex flex-col gap-12 tablet:gap-20 pt-8"
        >
          <Form method="POST" encType="multipart/form-data">
            <input type="hidden" name="intent" value="update-org" />

            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <h2 className="text-xl">General settings</h2>

                <FieldGroup className="gap-0 bg-card text-card-foreground flex flex-col rounded-xl border  py-0 pt-2 shadow-sm">
                  <Field className="flex-col tablet:flex-row gap-6 p-6 border-b ">
                    <div className="flex flex-col flex-grow">
                      <FieldLabel htmlFor="name">Organisation name</FieldLabel>
                      <FieldDescription className="text-xs">
                        The name of your organisation, displayed throughout the
                        dashboard.
                      </FieldDescription>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <Input
                        id="name"
                        type="text"
                        name="name"
                        defaultValue={data?.name}
                        placeholder="Acme Corporation"
                      />
                      <FieldError errors={[{ message: errors?.name }]} />
                    </div>
                  </Field>
                  <Field className="flex-col tablet:flex-row gap-6 p-6">
                    <div className="flex flex-col flex-grow">
                      <FieldLabel htmlFor="desc">About</FieldLabel>
                      <FieldDescription className="text-xs">
                        A short description to help your team understand the
                        organisation’s purpose.
                      </FieldDescription>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <Textarea
                        id="desc"
                        name="desc"
                        placeholder="What does your organisation do?"
                        defaultValue={data?.description}
                      />
                    </div>
                    <FieldError errors={[{ message: errors?.desc }]} />
                  </Field>
                  <Field className="flex-col tablet:flex-row justify-end border-t px-6 py-4">
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size={"sm"}
                        className="text-xs"
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <Spinner />} Save changes
                      </Button>
                    </div>
                  </Field>
                </FieldGroup>
              </div>

              <div className="flex flex-col gap-6">
                <h2 className="text-xl">Contact details</h2>

                <FieldGroup className="gap-0 bg-card text-card-foreground flex flex-col rounded-xl border  py-0 pt-2 shadow-sm">
                  <Field className="flex-col tablet:flex-row gap-6 p-6 border-b ">
                    <div className="flex flex-col flex-grow">
                      <FieldLabel htmlFor="email">Contact email</FieldLabel>
                      <FieldDescription className="text-xs">
                        Used for official communications and notifications.
                      </FieldDescription>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="contact@acme.com"
                        defaultValue={data?.email}
                      />
                      <FieldError errors={[{ message: errors?.email }]} />
                    </div>
                  </Field>
                  <Field className="flex-col tablet:flex-row gap-6 p-6 border-b ">
                    <div className="flex flex-col flex-grow">
                      <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                      <FieldDescription className="text-xs">
                        Useful for internal reference.
                      </FieldDescription>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="+1 555 123 4596"
                        defaultValue={data?.phone_number}
                      />
                    </div>
                  </Field>
                  <Field className="flex-col tablet:flex-row gap-6 p-6">
                    <div className="flex flex-col flex-grow">
                      <FieldLabel htmlFor="addr">Business address</FieldLabel>
                      <FieldDescription className="text-xs">
                        This can be a physical or mailing address.
                      </FieldDescription>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <Input
                        id="addr"
                        type="text"
                        name="address"
                        placeholder="123 Market Street, San Francisco, CA"
                        defaultValue={data?.address}
                      />
                    </div>
                  </Field>
                  <Field className="flex-col tablet:flex-row justify-end border-t px-6 py-4">
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size={"sm"}
                        className="text-xs"
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <Spinner />} Save changes
                      </Button>
                    </div>
                  </Field>
                </FieldGroup>
              </div>

              <div className="flex flex-col gap-6">
                <h2 className="text-xl">Branding</h2>

                <FieldGroup className="gap-0 bg-card text-card-foreground flex flex-col rounded-xl border  py-0 pt-2 shadow-sm">
                  <Field className="gap-6 p-6 ">
                    <div className="flex flex-row gap-6">
                      <div className="flex flex-col flex-grow">
                        <FieldLabel htmlFor="name">
                          Organisation logo
                        </FieldLabel>
                        <FieldDescription className="text-xs">
                          Used for official communications and notifications.
                        </FieldDescription>
                      </div>
                    </div>

                    <FileUploadInput
                      modes={["url"]}
                      value={extractImageUrl(data?.logo_url ?? "") ?? undefined}
                    />
                  </Field>
                  <Field className="flex-col tablet:flex-row justify-end border-t px-6 py-4">
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size={"sm"}
                        className="text-xs"
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <Spinner />} Save changes
                      </Button>
                    </div>
                  </Field>
                </FieldGroup>
              </div>
            </div>
          </Form>

          <AlertDialog>
            <div className="flex flex-col gap-6 w-full">
              <h2 className="text-xl">Delete organisation</h2>

              <div className="flex w-full flex-col gap-6">
                <Item
                  variant="muted"
                  className="border-destructive bg-destructive-muted"
                >
                  <ItemMedia variant="icon" className="bg-destructive">
                    <Trash2 className="size-4 text-primary-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      Permanently remove your project and its database.
                    </ItemTitle>
                    <ItemDescription className="line-clamp-none">
                      Permanently remove your organisation and all of its
                      contents from this platform. This action is not
                      reversible, so please continue with caution. Make sure you
                      have made a backup if you want to keep your data.
                    </ItemDescription>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        className="w-fit mt-2"
                        variant="destructive"
                      >
                        Delete organisation
                      </Button>
                    </AlertDialogTrigger>
                  </ItemContent>
                </Item>
              </div>
            </div>

            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Remove {data?.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove your organisation and all of its
                  contents from this platform. This action is not reversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isRemoving}
                  onClick={(e) => {
                    e.preventDefault();
                    remove();
                    // return true;
                  }}
                >
                  {isRemoving && <Spinner />}
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
        <TabsContent value="security">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsLoadingUI() {
  return (
    <div className="w-full min-h-full flex flex-col gap-8 items-stretch max-w-3xl lg:px-6 px-4 mx-auto pt-12">
      <div className="w-full flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
      </div>

      <div className="flex flex-row items-center gap-1">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="w-20 h-7" />
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 pt-8">
        <div className="flex flex-col gap-12 ">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-40 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
