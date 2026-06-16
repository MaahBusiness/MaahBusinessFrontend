import { cn } from "@/lib/utils";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import {
  AuthField,
  AuthPasswordField,
} from "@/components/auth/auth-field";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import GoogleAuthButton from "@/components/google-button";
import {
  AuthFormCard,
  AuthFormFooterLink,
  AuthLegalFooter,
  AuthLink,
} from "@/components/auth/auth-form-card";
import type { ServerActionState } from "types";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const actionData = useActionData<ServerActionState>();
  const navigation = useNavigation();
  const loaderData = useLoaderData<{ redirectTo?: string }>();

  const errors = actionData?.errors;
  const redirectTo = loaderData.redirectTo;

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const isSigninIn = isSubmitting && intent === "email-signin";

  return (
    <div className={cn(className)} {...props}>
      <AuthFormCard
        title="Sign in"
        description="Access your retail space."
        footer={
          <AuthFormFooterLink>
            Don&apos;t have an account?{" "}
            <AuthLink
              to={{
                pathname: "/auth/signup",
                search: `?redirectTo=${redirectTo}`,
              }}
            >
              Sign up
            </AuthLink>
          </AuthFormFooterLink>
        }
      >
        <Form method="post" className="auth-form">
          <input type="hidden" name="intent" value="email-signin" />
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <FieldGroup className="auth-form-fields">
            <AuthField
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              error={errors?.email}
              required
            />

            <div className="auth-field-stack">
              <AuthPasswordField error={errors?.password} />
              <div className="flex justify-end pt-0.5">
                <AuthLink
                  to="/auth/forgot-password"
                  className="text-sm font-medium"
                >
                  Forgot password?
                </AuthLink>
              </div>
            </div>

            <Field className="!gap-0 pt-1">
              <AuthSubmitButton loading={isSigninIn}>Sign in</AuthSubmitButton>
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
