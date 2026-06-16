import { cn } from "@/lib/utils";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Form, useActionData, useNavigation } from "react-router";
import { PasswordInput } from "@/components/forms/password-input";
import { useState } from "react";
import type { ServerActionState } from "types";
import {
  AuthFormCard,
  AuthFormFooterLink,
  AuthLink,
} from "@/components/auth/auth-form-card";

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
    <div className={cn(className)} {...props}>
      <AuthFormCard
        title="New password"
        description="Choose a strong password to secure your account."
        footer={
          <AuthFormFooterLink>
            <AuthLink to="/auth/signin">Return to sign in</AuthLink>
          </AuthFormFooterLink>
        }
      >
        <Form method="POST" className="auth-form">
          <FieldGroup className="auth-form-fields">
            <div className="auth-field-stack">
              <FieldLabel htmlFor="password" className="sr-only">
                New password
              </FieldLabel>
              <PasswordInput
                error={errors?.password}
                onValidityChange={setPasswordValid}
              />
            </div>

            <div className="auth-field-stack">
              <FieldLabel htmlFor="confirm-password" className="sr-only">
                Confirm password
              </FieldLabel>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
                className="auth-input"
                required
              />
              <FieldError errors={[{ message: errors?.confirm }]} />
            </div>

            <Field className="!gap-0 pt-1">
              <AuthSubmitButton
                loading={isSubmitting}
                disabled={!passwordValid}
              >
                Save new password
              </AuthSubmitButton>
            </Field>
          </FieldGroup>
        </Form>
      </AuthFormCard>
    </div>
  );
}
