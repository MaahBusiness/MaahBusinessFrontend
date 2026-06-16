import { cn } from "@/lib/utils";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { AuthField } from "@/components/auth/auth-field";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { ArrowLeft } from "lucide-react";
import type { SignUpActionType } from "types";
import { useCountdown } from "@/hooks/useCountdown";
import { formatSeconds, getInboxUrl } from "utils";
import {
  AuthFormCard,
  AuthFormFooterLink,
  AuthLink,
} from "@/components/auth/auth-form-card";

const MAX_RESEND_ATTEMPTS = 3;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigation = useNavigation();
  const actionData = useActionData<SignUpActionType>();
  const loaderData = useLoaderData<{ redirectTo?: string }>();

  const errors = actionData?.errors;
  const redirectTo = loaderData.redirectTo;
  const sesh = actionData?.otpSession;
  const resetLinkRemaining = useCountdown(sesh?.otpExpiresAt);
  const resendRemaining = useCountdown(sesh?.resendAvailableAt);

  const isSubmitting = navigation.state === "submitting";

  const canResend = resendRemaining === 0;
  const attemptsLeft = MAX_RESEND_ATTEMPTS - (sesh?.resendCount || 0);

  return (
    <div className={cn(className)} {...props}>
      <AuthFormCard
        title="Reset password"
        description={
          !sesh
            ? "Enter your email and we'll send you a reset link."
            : "Check your inbox for the reset link."
        }
        footer={
          <AuthFormFooterLink>
            Remember your password?{" "}
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
          <FieldGroup className="auth-form-fields">
            <input
              type="hidden"
              name="otpSession"
              value={JSON.stringify(actionData?.otpSession)}
            />

            {sesh && (
              <FieldDescription className="auth-info-banner text-sm leading-relaxed">
                {resetLinkRemaining > 0 ? (
                  <>
                    Link expires in{" "}
                    <strong className="font-semibold text-foreground">
                      {formatSeconds(resetLinkRemaining)}
                    </strong>
                    {" · "}
                    <AuthLink to={getInboxUrl(sesh.email)} className="text-sm">
                      {sesh.email}
                    </AuthLink>
                  </>
                ) : (
                  <span className="font-semibold text-destructive">
                    Link expired. Request a new one below.
                  </span>
                )}
              </FieldDescription>
            )}

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

            <Field className="!gap-0 pt-1">
              <AuthSubmitButton
                loading={isSubmitting}
                disabled={Boolean(
                  sesh && (resetLinkRemaining === 0 || !canResend),
                )}
              >
                {resendRemaining > 0
                  ? `Resend in ${formatSeconds(resendRemaining)}`
                  : (sesh?.resendCount || 0) >= MAX_RESEND_ATTEMPTS
                    ? "Send again"
                    : sesh
                      ? `Resend link${attemptsLeft < MAX_RESEND_ATTEMPTS ? ` (${attemptsLeft} left)` : ""}`
                      : "Send reset link"}
              </AuthSubmitButton>
            </Field>

            <Link
              to="/auth/signin"
              className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
          </FieldGroup>
        </Form>
      </AuthFormCard>
    </div>
  );
}
