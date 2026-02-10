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
import { Spinner } from "@/components/ui/spinner";
import GoogleAuthButton from "@/components/google-button";
import type { ServerActionState } from "types";
import { SITE_NAME } from "types/consts";

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form method="post">
        <input type="hidden" name="intent" value="email-signin" />
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <FieldGroup>
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
            <h1 className="text-xl font-bold">Sign in to {SITE_NAME}</h1>
            <FieldDescription>
              Enter your email below to login to your account
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="text"
              name="email"
              placeholder="m@example.com"
              required
            />
            <FieldError errors={[{ message: errors?.email }]} />
          </Field>
          <Field>
            <div className="flex items-center ">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                to="/auth/forgot-password"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" name="password" required />
            <FieldError errors={[{ message: errors?.password }]} />
          </Field>
          <Field>
            <Button type="submit" disabled={isSigninIn}>
              {isSigninIn && <Spinner />}Sign in
            </Button>
          </Field>

          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Or continue with
          </FieldSeparator>

          <Field>
            <GoogleAuthButton />
          </Field>

          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
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

      {/* <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription> */}
    </div>
  );
}
