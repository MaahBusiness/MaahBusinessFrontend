import { cn } from "@/lib/utils";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { AuthField } from "@/components/auth/auth-field";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { PasswordInput } from "@/components/forms/password-input";
import { useState } from "react";
import GoogleAuthButton from "@/components/google-button";
import {
  AuthFormCard,
  AuthFormFooterLink,
  AuthLegalFooter,
  AuthLink,
} from "@/components/auth/auth-form-card";
import type { ServerActionState } from "types";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [passwordValid, setPasswordValid] = useState(false);
  const actionData = useActionData<ServerActionState>();
  const loaderData = useLoaderData<{ redirectTo?: string }>();
  const navigation = useNavigation();

  const errors = actionData?.errors;
  const redirectTo = loaderData.redirectTo;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isEmailSubmitting = isSubmitting && intent === "email-signup";

  return (
    <div className={cn(className)} {...props}>
      <AuthFormCard
        title="Create account"
        description="Start managing inventory, sales, and your team."
        footer={
          <AuthFormFooterLink>
            Already have an account?{" "}
            <AuthLink
              to={{
                pathname: "/auth/signin",
                search: `?redirectTo=${redirectTo}`,
              }}
            >
              Sign in
            </AuthLink>
          </AuthFormFooterLink>
        }
      >
        <Form method="post" className="auth-form">
          <input type="hidden" name="intent" value="email-signup" />
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <FieldGroup className="auth-form-fields">
            <AuthField
              id="name"
              name="name"
              label="Full name"
              type="text"
              placeholder="Full name"
              autoComplete="name"
              error={errors?.name}
              required
            />

            <AuthField
              id="email"
              name="email"
              label="Work email"
              type="email"
              placeholder="Work email"
              autoComplete="email"
              error={errors?.email}
              required
            />

            <div className="auth-field-stack">
              <FieldLabel htmlFor="password" className="sr-only">
                Password
              </FieldLabel>
              <PasswordInput
                error={errors?.password}
                onValidityChange={setPasswordValid}
              />
            </div>

            <Field className="!gap-0 pt-1">
              <AuthSubmitButton
                loading={isEmailSubmitting}
                disabled={!passwordValid}
              >
                Create account
              </AuthSubmitButton>
            </Field>

            <Field className="!gap-0">
              <GoogleAuthButton />
            </Field>
          </FieldGroup>
        </Form>
      </AuthFormCard>

      <AuthLegalFooter />
    </div>
  );
}
