import { cn } from "@/lib/utils";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import GoogleAuthButton from "@/components/google-button";
import { Spinner } from "@/components/ui/spinner";
import { useCountdown } from "@/hooks/useCountdown";
import { formatSeconds, getInboxUrl } from "utils";
import {
  AuthFormCard,
  AuthFormFooterLink,
  AuthLink,
} from "@/components/auth/auth-form-card";
import type { SignUpActionType } from "types";
import { ShieldCheck } from "lucide-react";

interface OTPFormProps extends React.ComponentProps<"div"> {
  login?: boolean;
}

const MAX_RESEND_ATTEMPTS = 3;

export function OTPForm({ className, login, ...props }: OTPFormProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const actionData = useActionData<SignUpActionType>();
  const loaderData = useLoaderData<{ redirectTo?: string }>();

  const errors = actionData?.errors;
  const redirectTo = loaderData.redirectTo;
  const { email, otpExpiresAt, resendAvailableAt, resendCount } =
    actionData?.otpSession!;

  const otpRemaining = useCountdown(otpExpiresAt);
  const resendRemaining = useCountdown(resendAvailableAt);

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");

  const isOtpSubmitting = isSubmitting && intent === "verify-otp";
  const isOtpResending = isSubmitting && intent === "resend-otp";

  const canResend = resendRemaining === 0;
  const attemptsLeft = MAX_RESEND_ATTEMPTS - resendCount;

  const handleResend = () => {
    submit(
      {
        intent: "resend-otp",
        otpSession: JSON.stringify(actionData?.otpSession),
      },
      { method: "POST" },
    );
  };

  return (
    <div className={cn(className)} {...props}>
      <AuthFormCard
        title="Verify your email"
        step={2}
        description={
          <>
            We sent a 6-digit code to{" "}
            <AuthLink to={getInboxUrl(email)}>{email}</AuthLink>
            . Enter it below to continue.
          </>
        }
        footer={
          login ? (
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
          ) : (
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
          )
        }
      >
        <Form method="post" className="auth-form">
          <FieldGroup className="auth-form-fields">
            <input type="hidden" name="intent" value="verify-otp" />
            <input
              type="hidden"
              name="otpSession"
              value={JSON.stringify(actionData?.otpSession)}
            />

            <div className="auth-info-banner">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-violet-600 dark:text-violet-400" />
              <FieldDescription className="text-sm leading-relaxed">
                {otpRemaining > 0 ? (
                  <>
                    Code expires in{" "}
                    <strong className="font-semibold text-foreground">
                      {formatSeconds(otpRemaining)}
                    </strong>
                  </>
                ) : (
                  <span className="font-semibold text-destructive">
                    This code has expired. Request a new one below.
                  </span>
                )}
              </FieldDescription>
            </div>

            <Field>
              <FieldLabel htmlFor="otp" className="sr-only">
                Verification code
              </FieldLabel>
              <InputOTP
                maxLength={6}
                id="otp"
                name="otp"
                required
                containerClassName="justify-center gap-3"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="auth-otp-slot" />
                  <InputOTPSlot index={1} className="auth-otp-slot" />
                </InputOTPGroup>
                <InputOTPSeparator className="text-muted-foreground/40" />
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={2} className="auth-otp-slot" />
                  <InputOTPSlot index={3} className="auth-otp-slot" />
                </InputOTPGroup>
                <InputOTPSeparator className="text-muted-foreground/40" />
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={4} className="auth-otp-slot" />
                  <InputOTPSlot index={5} className="auth-otp-slot" />
                </InputOTPGroup>
              </InputOTP>
              <FieldError errors={[{ message: errors?.otp }]} />
            </Field>

            <Field>
              <AuthSubmitButton
                loading={isOtpSubmitting}
                disabled={otpRemaining === 0}
              >
                Verify email
              </AuthSubmitButton>
            </Field>

            <FieldDescription className="text-center text-sm">
              Didn&apos;t receive the code?{" "}
              <Button
                type="button"
                onClick={handleResend}
                variant="link"
                className="h-auto p-0 font-semibold text-violet-600 dark:text-violet-400"
                disabled={isOtpResending || !canResend}
              >
                {isOtpResending && <Spinner className="size-3" />}
                {resendRemaining > 0
                  ? `Resend in ${formatSeconds(resendRemaining)}`
                  : resendCount >= MAX_RESEND_ATTEMPTS
                    ? "Request new code"
                    : `Resend code${attemptsLeft < MAX_RESEND_ATTEMPTS ? ` (${attemptsLeft} left)` : ""}`}
              </Button>
            </FieldDescription>

            <Field className="!gap-0">
              <GoogleAuthButton otpSession={actionData?.otpSession} />
            </Field>
          </FieldGroup>
        </Form>
      </AuthFormCard>
    </div>
  );
}
