// otp-form.tsx
import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import GoogleAuthButton from "@/components/google-button";
import { Spinner } from "@/components/ui/spinner";
import { useCountdown } from "@/hooks/useCountdown";
import { formatSeconds, getInboxUrl } from "utils";
import type { SignUpActionType } from "types";

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
    actionData?.otpSession!; // otpSession exists here since it has been checked before displaying this UI

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form method="post">
        <FieldGroup>
          <input type="hidden" name="intent" value="verify-otp" />
          <input
            type="hidden"
            name="otpSession"
            value={JSON.stringify(actionData?.otpSession)}
          />

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
            <h1 className="text-xl font-bold">Enter verification code</h1>
            <FieldDescription className="text-xs">
              We sent a 6-digit code to{" "}
              <Link to={getInboxUrl(email)} className="font-medium underline">
                {email}
              </Link>
              .
              <br />
              {otpRemaining > 0 ? (
                <>
                  The code expires in{" "}
                  <strong className="text-foreground">
                    {formatSeconds(otpRemaining)}
                  </strong>
                </>
              ) : (
                <span className="text-destructive font-medium">
                  This code has expired. Please request a new one.
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
              containerClassName="gap-4 justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldError errors={[{ message: errors?.otp }]} />
          </Field>

          <Field>
            <Button
              type="submit"
              disabled={isOtpSubmitting || otpRemaining === 0}
            >
              {isOtpSubmitting && <Spinner />}
              Verify
            </Button>
          </Field>

          <FieldDescription className="text-center text-sm">
            Didn&apos;t receive the code?{" "}
            <Button
              type="button"
              onClick={handleResend}
              variant="link"
              className="p-0 h-auto font-normal"
              disabled={isOtpResending || !canResend}
            >
              {isOtpResending && <Spinner className="size-3" />}
              {resendRemaining > 0
                ? `Resend available in ${formatSeconds(resendRemaining)}`
                : resendCount >= MAX_RESEND_ATTEMPTS
                  ? "Request new code"
                  : `Resend code${attemptsLeft < MAX_RESEND_ATTEMPTS ? ` (${attemptsLeft} left)` : ""}`}
            </Button>
          </FieldDescription>

          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Or continue with
          </FieldSeparator>

          <Field>
            <GoogleAuthButton otpSession={actionData?.otpSession} />
          </Field>

          {login ? (
            <FieldDescription className="text-center">
              Don't have an account yet?{" "}
              <Link
                to={{
                  pathname: "/auth/signup",
                  search: `?redirectTo=${redirectTo}`,
                }}
                className="font-medium underline"
              >
                Sign up
              </Link>
            </FieldDescription>
          ) : (
            <FieldDescription className="text-center">
              Already have an account?{" "}
              <Link
                to={{
                  pathname: "/auth/signin",
                  search: `?redirectTo=${redirectTo}`,
                }}
                className="font-medium underline"
              >
                Sign in
              </Link>
            </FieldDescription>
          )}
        </FieldGroup>
      </Form>

      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
