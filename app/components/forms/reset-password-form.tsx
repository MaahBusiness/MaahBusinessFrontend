import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Form, useActionData, useNavigation } from "react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { PasswordInput } from "@/components/forms/password-input";
import { useState } from "react";
import type { ServerActionState } from "types";
import { Spinner } from "@/components/ui/spinner";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [passwordValid, setPasswordValid] = useState(false);
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();

  const errors = actionData?.errors;

  const isSubmitting = navigation.state === "submitting";
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form method="POST">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Change your password</h1>
            <FieldDescription>
              Welcome back! Choose a new strong password and save it to proceed
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              error={errors?.password}
              onValidityChange={setPasswordValid}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="Please confirm your password."
              required
            />
            <FieldError errors={[{ message: errors?.confirm }]} />
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmitting || !passwordValid}>
              {isSubmitting && <Spinner />}
              Save new password
            </Button>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  );
}
