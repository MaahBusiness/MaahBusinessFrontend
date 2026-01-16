// signup-form.tsx
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
import { Input } from "@/components/ui/input";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { PasswordInput } from "@/components/forms/password-input";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import GoogleAuthButton from "@/components/google-button";
import type { ServerActionState } from "types";

// interface SignupFormProps extends React.ComponentProps<"div"> {
//   errors?: Record<string, string>;
// }

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form method="post">
        <input type="hidden" name="intent" value="email-signup" />

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
            <h1 className="text-xl font-bold">Create your account</h1>
            <FieldDescription>
              Fill in the form below to create your account
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel htmlFor="name">Full Name</FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
            />
            <FieldError errors={[{ message: errors?.name }]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
            />
            <FieldError errors={[{ message: errors?.email }]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              error={errors?.password}
              onValidityChange={setPasswordValid}
            />
          </Field>

          <Field>
            <Button
              type="submit"
              disabled={isEmailSubmitting || !passwordValid}
            >
              {isEmailSubmitting && <Spinner />}
              Create account
            </Button>
          </Field>

          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Or continue with
          </FieldSeparator>

          <Field>
            <GoogleAuthButton />
          </Field>

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
        </FieldGroup>
      </Form>

      <FieldDescription className="px-6 text-center">
        If you refreshed the OTP screen by mistake, please head to{" "}
        <Link
          to={{
            pathname: "/auth/signin",
            search: `?redirectTo=${redirectTo}`,
          }}
        >
          Sign in
        </Link>
      </FieldDescription>

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
