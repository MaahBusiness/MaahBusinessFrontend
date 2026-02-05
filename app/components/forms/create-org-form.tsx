import { Avatar, BoringFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import FileUploadInput from "@/components/ui/file-upload-input";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";

import { ChevronDown } from "lucide-react";
import {
  Form,
  Link,
  useActionData,
  useNavigate,
  useNavigation,
} from "react-router";
import type { ServerActionState } from "types";

export function CreateOrgForm({ ...props }: React.ComponentProps<typeof Card>) {
  const { user } = useAuth();
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();
  let navigate = useNavigate();

  const errors = actionData?.errors;
  const isSubmitting = navigation.state === "submitting";

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  return (
    <Form method="POST" encType="multipart/form-data">
      <input type="hidden" name="intent" value="create-org" />

      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <h2 className="text-xl">Organisation details</h2>

          <FieldGroup className="gap-0 bg-card text-card-foreground flex flex-col rounded-xl border border-border py-2 shadow-sm">
            <Field className="flex-row gap-6 p-6 border-b border-border">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="name">Organisation name</FieldLabel>
                <FieldDescription className="text-xs">
                  What's the name of your company or team? You can change this
                  later.
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Acme Corporation"
                  required
                />
                <FieldError errors={[{ message: errors?.name }]} />
              </div>
            </Field>
            <Field className="flex-row gap-6 p-6">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="name">Description</FieldLabel>
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
                  required
                />
              </div>
              <FieldError errors={[{ message: errors?.desc }]} />
            </Field>
          </FieldGroup>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl">Contact details</h2>

          <FieldGroup className="gap-0 bg-card text-card-foreground flex flex-col rounded-xl border border-border py-2 shadow-sm">
            <Field className="flex-row gap-6 p-6 border-b border-border">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="name">Contact email</FieldLabel>
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
                  required
                />
                <FieldError errors={[{ message: errors?.email }]} />
              </div>
            </Field>
            <Field className="flex-row gap-6 p-6 border-b border-border">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="name">Phone number (optional)</FieldLabel>
                <FieldDescription className="text-xs">
                  Optional, but useful for internal reference.
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="name"
                  type="tel"
                  name="phone"
                  placeholder="+1 555 123 4596"
                />
              </div>
            </Field>
            <Field className="flex-row gap-6 p-6">
              <div className="flex flex-col flex-grow">
                <FieldLabel htmlFor="name">
                  Business address (optional)
                </FieldLabel>
                <FieldDescription className="text-xs">
                  This can be a physical or mailing address.{" "}
                </FieldDescription>
              </div>
              <div className="flex flex-col flex-grow">
                <Input
                  id="addr"
                  type="text"
                  name="address"
                  placeholder="123 Market Street, San Francisco, CA"
                />
              </div>
            </Field>
          </FieldGroup>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl">Branding</h2>

          <FieldGroup className="gap-0 bg-card text-card-foreground flex flex-col rounded-xl border border-border py-2 shadow-sm">
            <Field className="gap-6 p-6 ">
              <div className="flex flex-row gap-6">
                <div className="flex flex-col flex-grow">
                  <FieldLabel htmlFor="name">
                    Organisation logo (optional)
                  </FieldLabel>
                  <FieldDescription className="text-xs">
                    Used for official communications and notifications.
                  </FieldDescription>
                </div>
                <div className="flex flex-col flex-grow">
                  <FieldDescription className="text-xs">
                    Upload a file from your device or provide a URL
                  </FieldDescription>
                  <FieldDescription className="text-xs">
                    For images: PNG, JPG, or SVG · Max 2MB{" "}
                  </FieldDescription>
                </div>
              </div>

              <FileUploadInput />
            </Field>
          </FieldGroup>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl">Team Members</h2>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="size-10">
                    <AvatarImage src={user?.avatar_url} />
                    <BoringFallback name={user?.name} />
                  </Avatar>

                  <div>
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="ml-auto bg-card">
                      Owner <ChevronDown className="text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="end">
                    <Command>
                      <CommandInput placeholder="Select new role..." />
                      <CommandList>
                        <CommandEmpty>No roles found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            disabled
                            className="teamaspace-y-1 flex flex-col items-start px-4 py-2"
                          >
                            <p>Cashier</p>
                            <p className="text-sm text-muted-foreground">
                              Can view and comment.
                            </p>
                          </CommandItem>
                          <CommandItem
                            disabled
                            className="teamaspace-y-1 flex flex-col items-start px-4 py-2"
                          >
                            <p>Stock keeper</p>
                            <p className="text-sm text-muted-foreground">
                              Can view, comment and edit.
                            </p>
                          </CommandItem>
                          <CommandItem
                            disabled
                            className="teamaspace-y-1 flex flex-col items-start px-4 py-2"
                          >
                            <p>Manager</p>
                            <p className="text-sm text-muted-foreground">
                              Can view, comment and manage billing.
                            </p>
                          </CommandItem>
                          <CommandItem className="teamaspace-y-1 flex flex-col items-start px-4 py-2">
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
              </div>
            </CardContent>
          </Card>
        </div>

        <Field className="grid gap-4 sm:grid-cols-2">
          <Button variant={"outline"} onClick={handleBack}>
            Cancel{" "}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner />}Create organisation
          </Button>
        </Field>
      </div>
    </Form>
  );
}
