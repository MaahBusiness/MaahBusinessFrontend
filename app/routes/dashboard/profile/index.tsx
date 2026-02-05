import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldContent,
  FieldTitle,
} from "@/components/ui/field";
import FileUploadInput from "@/components/ui/file-upload-input";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Form, useNavigation, useParams, useSubmit } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestFailed } from "@/routes/404";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item";
import { LogOut } from "lucide-react";
import { extractImageUrl, genericErrorState } from "utils";
import { commitSession, getSession } from "@/lib/session.server";
import type { ServerActionState, User } from "types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DarkTheme, LightTheme, SystemTheme } from "@/components/theme-svgs";
import { useTheme } from "@/contexts/theme-context";
import { apiClient } from "@/lib/api-client";
import type { Route } from ".react-router/types/app/routes/dashboard/profile/+types";

export async function action({
  request,
  params,
}: Route.ActionArgs): Promise<ServerActionState & { user?: User }> {
  const formData = await request.formData();
  const session = await getSession(request);
  const intent = formData.get("intent");

  const name = formData.get("name") as string | undefined;
  const phone = formData.get("phone") as string | undefined;
  const address = formData.get("address") as string | undefined;
  const url = formData.get("url") as string | undefined;

  const errors: Record<string, string> = {};

  switch (intent) {
    case "update-profile": {
      if (!name) errors.name = "Please enter your name.";

      if (Object.keys(errors).length > 0) return { success: false, errors };

      if (session?.accessToken)
        return await apiClient
          .put<User>("/auth/profile/update/", session?.accessToken, {
            name,
            address,
            phone_number: phone,
            avatar_url: url,
          })
          .then(async (res) => {
            await commitSession({
              accessToken: session.accessToken,
              refreshToken: session?.refreshToken,
              user: res.data,
            });

            return res;
          });
    }

    default:
      return genericErrorState();
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SettingsPage({ actionData }: Route.ComponentProps) {
  const { user, isAuthenticated, setUser } = useAuth();
  const navigation = useNavigation();
  const { setTheme, theme } = useTheme();
  const submit = useSubmit();

  const errors = actionData?.errors;
  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");

  const isSigningOut = isSubmitting && intent === "signout";

  const handleSignOut = () => {
    submit({ intent: "signout" }, { method: "POST" });
  };

  // Show toasts based on action results
  useEffect(() => {
    if (actionData?.message) {
      if (!actionData.success) toast.error(actionData.message);
      else toast.success(actionData.message);
    }

    if (actionData?.success) {
      setUser(actionData.user);
      toast.success("Profile has been updated succesfully!");
    }
  }, [actionData]);

  if (!user) return <SettingsLoadingUI />;
  if (!isAuthenticated) return <RequestFailed />;

  return (
    <div className="w-full min-h-full flex flex-col gap-12 items-stretch max-w-3xl lg:px-6 px-4 mx-auto py-12">
      <div className="w-full">
        <h1 className="text-lg font-medium">Preferences</h1>
        <h2 className="text-muted-foreground text-sm font-medium">
          Manage your account profile, connections, and dashboard experience.
        </h2>
      </div>

      <Form method="POST" encType="multipart/form-data">
        <input type="hidden" name="intent" value="update-profile" />

        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <h2 className="text-xl">Profile information</h2>

            <FieldGroup className="gap-0 bg-card text-card-foreground flex flex-col rounded-xl border  py-0 pt-2 shadow-sm">
              <Field className="flex-row gap-6 p-6 border-b ">
                <div className="flex flex-col flex-grow">
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <FieldDescription className="text-xs">
                    Username appears as a display name throughout the
                    dashboard.{" "}
                  </FieldDescription>
                </div>
                <div className="flex flex-col flex-grow">
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    defaultValue={user.name}
                    placeholder="John Doe"
                  />
                  <FieldError errors={[{ message: errors?.name }]} />
                </div>
              </Field>
              <Field className="flex-row gap-6 p-6 border-b ">
                <div className="flex flex-col flex-grow">
                  <FieldLabel htmlFor="email">Primary email</FieldLabel>

                  <FieldDescription className="text-xs">
                    Primary email is used for account notifications.
                  </FieldDescription>
                </div>
                <div className="flex flex-col flex-grow">
                  <Select
                    // name="email"
                    value={user.email}
                    disabled
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select email..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={user.email}>{user.email}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[{ message: errors?.email }]} />
                </div>
              </Field>

              <Field className="flex-row gap-6 p-6 border-b ">
                <div className="flex flex-col flex-grow">
                  <FieldLabel htmlFor="phone">Phone number</FieldLabel>
                </div>
                <div className="flex flex-col flex-grow">
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+1 555 123 4596"
                    defaultValue={user?.phone_number}
                  />
                </div>
              </Field>
              <Field className="flex-row gap-6 p-6 border-b">
                <div className="flex flex-col flex-grow">
                  <FieldLabel htmlFor="name">Address</FieldLabel>
                </div>
                <div className="flex flex-col flex-grow">
                  <Input
                    id="addr"
                    type="text"
                    name="address"
                    placeholder="123 Market Street, San Francisco, CA"
                    defaultValue={user?.address}
                  />
                </div>
              </Field>

              <Field className="gap-6 p-6 ">
                <div className="flex flex-row gap-6">
                  <div className="flex flex-col flex-grow">
                    <FieldLabel htmlFor="name">Profile image</FieldLabel>
                  </div>
                </div>

                <FileUploadInput
                  modes={["url"]}
                  value={extractImageUrl(user?.avatar_url ?? "") ?? undefined}
                />
              </Field>
              <Field className="flex-row justify-end border-t px-6 py-4">
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

      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <h2 className="text-xl">Appearance</h2>

          <FieldGroup className="gap-0 bg-card text-card-foreground flex flex-col rounded-xl border  py-0 pt-2 shadow-sm">
            <Field className="flex-row gap-2 p-6 ">
              <div className="flex flex-col grow-0">
                <FieldLabel htmlFor="name">Theme</FieldLabel>
                <FieldDescription className="text-xs">
                  Choose how the application looks to you. Select a single
                  theme, or sync with your system.
                </FieldDescription>
              </div>
              <div className="flex flex-col  flex-grow">
                <RadioGroup
                  // defaultValue={theme}
                  value={theme}
                  onValueChange={(e) =>
                    setTheme(e as "dark" | "light" | "system")
                  }
                  className="max-w-sm grid grid-cols-2"
                >
                  <FieldLabel htmlFor="dark">
                    <Field orientation="horizontal" className="p-2">
                      <FieldContent>
                        <FieldDescription>
                          <DarkTheme />
                        </FieldDescription>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="dark" id="dark" />
                          <FieldTitle>Dark</FieldTitle>
                        </div>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                  <FieldLabel htmlFor="light">
                    <Field orientation="horizontal" className="p-2">
                      <FieldContent>
                        <FieldDescription>
                          <LightTheme />
                        </FieldDescription>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="light" id="light" />
                          <FieldTitle>Light</FieldTitle>
                        </div>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                  <FieldLabel htmlFor="system">
                    <Field orientation="horizontal" className="p-2">
                      <FieldContent>
                        <FieldDescription>
                          <SystemTheme />
                        </FieldDescription>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="system" id="system" />
                          <FieldTitle>System</FieldTitle>
                        </div>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </div>
            </Field>
          </FieldGroup>
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <h2 className="text-xl">Session</h2>

        <div className="flex w-full flex-col gap-6">
          <Item variant="muted" className="border-destructive">
            <ItemMedia variant="icon">
              <LogOut className="size-4 " />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Sign out</ItemTitle>
              <ItemDescription className="line-clamp-none">
                Sign out your account from this device. You can sign back in at
                anytime with your email and password.
              </ItemDescription>
              <Button
                size="sm"
                className="w-fit mt-2"
                variant="secondary"
                onSelect={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }}
                disabled={isSigningOut}
              >
                {isSigningOut && <Spinner className="size-3" />}
                Sign out
              </Button>
            </ItemContent>
          </Item>
        </div>
      </div>
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
