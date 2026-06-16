import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import { Link } from "react-router";
import { SITE_NAME } from "types/consts";

interface AuthFormCardProps {
  title: string;
  description?: React.ReactNode;
  tagline?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  step?: number;
}

export function AuthFormCard({
  title,
  description,
  tagline = "Inventory & sales management",
  children,
  footer,
  className,
  step = 1,
}: AuthFormCardProps) {
  return (
    <div
      className="auth-card-wrapper animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${step * 60}ms` }}
    >
      <div aria-hidden className="auth-card-glow" />
      <Card
        className={cn(
          "auth-card relative gap-0 overflow-hidden border-0 py-0",
          className,
        )}
      >
        <div aria-hidden className="auth-card-accent absolute inset-x-0 top-0 h-1" />

        {/* Brand — centered */}
        <CardHeader className="auth-card-brand relative space-y-0 px-8 pb-0 pt-8 text-center">
          <Link
            to="/"
            className="mx-auto inline-flex flex-col items-center gap-2 transition-opacity hover:opacity-90"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
              <Package className="size-5" strokeWidth={2} />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              {SITE_NAME}
            </span>
            <span className="text-xs text-muted-foreground">{tagline}</span>
          </Link>
        </CardHeader>

        {/* Title block — centered, separated */}
        <div className="auth-card-title-block px-8 pb-6 pt-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-1.5 text-sm leading-relaxed">
              {description}
            </CardDescription>
          )}
        </div>

        <div aria-hidden className="auth-card-divider mx-8" />

        <CardContent className="relative px-8 py-6">{children}</CardContent>

        {footer && (
          <>
            <div aria-hidden className="auth-card-divider mx-8" />
            <CardFooter className="relative px-8 py-5">{footer}</CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

export function AuthFormFooterLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "w-full text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function AuthLink({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "font-semibold text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function AuthLegalFooter() {
  return (
    <p className="auth-legal mt-5 text-center text-xs leading-relaxed text-muted-foreground">
      By continuing, you agree to our{" "}
      <a href="#" className="auth-inline-link">
        Terms of Service
      </a>{" "}
      and{" "}
      <a href="#" className="auth-inline-link">
        Privacy Policy
      </a>
      .
    </p>
  );
}
