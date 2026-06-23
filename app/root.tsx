import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./styles/app.css";

import "non.geist";
import "non.geist/italic";
import "non.geist/mono";
import "non.geist/mono-italic";

import { ThemeProvider } from "@/contexts/theme-context";
import { StyleGuard } from "@/components/layout/style-guard";
import { Toaster } from "sonner";
import { requireUserSession } from "@/lib/session.server";
import { getSecurityHeaders } from "@/lib/security-headers.server";
import { AuthProvider } from "@/contexts/auth-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { SITE_NAME } from "types/consts";
import {
  CRITICAL_APP_CSS,
  CSS_RECOVERY_SCRIPT,
  THEME_INIT_SCRIPT,
} from "@/lib/style-safety";

export function meta() {
  return [{ title: `${SITE_NAME}` }];
}

export function headers({ request }: Route.HeadersArgs) {
  return getSecurityHeaders(request);
}

export async function loader({ request }: Route.LoaderArgs) {
  const { session, headers } = await requireUserSession(request);
  return data({ session }, headers ? { headers } : undefined);
}

function DocumentHeadAssets() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      <style
        data-critical-app-css=""
        dangerouslySetInnerHTML={{ __html: CRITICAL_APP_CSS }}
      />
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="theme-color"
          content="rgb(250 250 250)"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="rgb(23 23 23)"
          media="(prefers-color-scheme: dark)"
        />
        <DocumentHeadAssets />
        <Meta />
        <Links />
      </head>
      <body className="font-sans bg-background text-sm">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="vite-ui-theme"
          disableTransitionOnChange
        >
          <StyleGuard />
          {children}
          <Toaster position="top-right" className="z-100" />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <script dangerouslySetInnerHTML={{ __html: CSS_RECOVERY_SCRIPT }} />
      </body>
    </html>
  );
}

export default function Root({ loaderData }: Route.ComponentProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider session={loaderData?.session}>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error(error);

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? "Page not found" : `Error ${error.status}`;
    message =
      error.status === 404
        ? "The page you requested does not exist."
        : error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{title}</title>
        <DocumentHeadAssets />
        <Meta />
        <Links />
      </head>
      <body className="font-sans bg-background text-sm">
        <main className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            {import.meta.env.DEV && error instanceof Error && error.stack && (
              <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-left text-xs">
                {error.stack}
              </pre>
            )}
            <a
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Go home
            </a>
          </div>
        </main>
        <Scripts />
        <script dangerouslySetInnerHTML={{ __html: CSS_RECOVERY_SCRIPT }} />
      </body>
    </html>
  );
}
