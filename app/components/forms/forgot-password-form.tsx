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
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { GalleryVerticalEnd } from "lucide-react";
import type { SignUpActionType } from "types";
import { Spinner } from "@/components/ui/spinner";
import { useCountdown } from "@/hooks/useCountdown";
import { formatSeconds, getInboxUrl } from "utils";
import { SITE_NAME } from "types/consts";

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form method="post">
        <FieldGroup>
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
              <span className="sr-only">{SITE_NAME}</span>
            </a>
            <h1 className="text-xl font-bold">Forgot your password?</h1>
            <FieldDescription>
              {!sesh ? (
                <>
                  Enter your user account's verified email address and we will
                  send you a password reset link.
                </>
              ) : (
                <>
                  We sent a 6-digit code to{" "}
                  <Link
                    to={getInboxUrl(sesh.email)}
                    className="font-medium underline"
                  >
                    {sesh.email}
                  </Link>
                </>
              )}

              <br />
              {sesh &&
                (resetLinkRemaining > 0 ? (
                  <>
                    The code expires in{" "}
                    <strong className="text-foreground">
                      {formatSeconds(resetLinkRemaining)}
                    </strong>
                  </>
                ) : (
                  <span className="text-destructive font-medium">
                    This code has expired. Please request a new one.{" "}
                  </span>
                ))}
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
            <FieldError errors={[{ message: errors?.email }]} />
          </Field>

          <Field>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (sesh && (resetLinkRemaining === 0 || !canResend))
              }
            >
              {isSubmitting && <Spinner />}
              {resendRemaining > 0
                ? `Resend available in ${formatSeconds(resendRemaining)}`
                : (sesh?.resendCount || 0) > 1 ||
                    (sesh?.resendCount || 0) >= MAX_RESEND_ATTEMPTS
                  ? "Send again"
                  : `Send reset link${attemptsLeft < MAX_RESEND_ATTEMPTS ? ` (${attemptsLeft} left)` : ""}`}
            </Button>
          </Field>

          <FieldDescription className="text-center">
            Don't have an account yet?{" "}
            <Link
              to={{
                pathname: "/auth/signup",
                search: `?redirectTo=${redirectTo}`,
              }}
            >
              Sign up
            </Link>
          </FieldDescription>
        </FieldGroup>
      </Form>
    </div>
  );
}
