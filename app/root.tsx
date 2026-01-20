import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import type { Route } from "./+types/root";
import "./styles/app.css";

import "non.geist"; // OR
import "non.geist/italic";

// For Geist Mono
import "non.geist/mono"; // OR
import "non.geist/mono-italic";
import { ThemeProvider } from "@/contexts/theme-context";
import { ClientOnly } from "@/contexts/client-only";
import { Toaster } from "sonner";
import { requireUserSession } from "@/lib/session.server";
import { AuthProvider } from "@/contexts/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// import "@fontsource/geist-mono/variable.css";

// export const links: Route.LinksFunction = () => [
//   { rel: "preconnect", href: "https://fonts.googleapis.com" },
//   {
//     rel: "preconnect",
//     href: "https://fonts.gstatic.com",
//     crossOrigin: "anonymous",
//   },
//   {
//     rel: "stylesheet",
//     href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
//   },
// ];

// ------------------------------
// Loader - runs on every route
// ------------------------------
export async function loader({ request }: Route.LoaderArgs) {
  const { session, headers } = await requireUserSession(request);

  return { session, headers };
}

// Create QueryClient once per app load
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes - data considered fresh
      gcTime: 40 * 60 * 1000, // 40 minutes - cache garbage collection
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Retry failed requests once
    },
  },
});

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
        <Meta />
        <Links />
      </head>
      <body className="font-sans bg-background text-xs">
        <ClientOnly>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            {children}
          </ThemeProvider>
          <Toaster position="top-right" />
        </ClientOnly>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// ------------------------------
// Root Component with Auth Provider
// ------------------------------
export default function Root({ loaderData }: Route.ComponentProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider session={loaderData?.session}>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}

// export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
//   let message = "Oops!";
//   let details = "An unexpected error occurred.";
//   let stack: string | undefined;

//   if (isRouteErrorResponse(error)) {
//     message = error.status === 404 ? "404" : "Error";
//     details =
//       error.status === 404
//         ? "The requested page could not be found."
//         : error.statusText || details;
//   } else if (import.meta.env.DEV && error && error instanceof Error) {
//     details = error.message;
//     stack = error.stack;
//   }

//   return (
//     <main className="pt-16 p-4 container mx-auto">
//       <h1>{message}</h1>
//       <p>{details}</p>
//       {stack && (
//         <pre className="w-full p-4 overflow-x-auto">
//           <code>{stack}</code>
//         </pre>
//       )}
//     </main>
//   );
// }

// ------------------------------
// Error Boundary (only for critical errors)
// ------------------------------
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error(error);

  // Let child routes handle their own 404s
  // This only catches critical errors that bubble up
  return (
    <html lang="en">
      <head>
        <title>Critical Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Critical Error</h1>
            <p className="text-muted-foreground max-w-md">
              A critical error occurred. Our team has been notified.
            </p>
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-4 text-left text-xs bg-muted p-4 rounded overflow-auto max-w-2xl">
                {error instanceof Error
                  ? error.stack
                  : JSON.stringify(error, null, 2)}
              </pre>
            )}
            <div className="pt-4">
              <a href="/" className="text-primary underline">
                Go back home
              </a>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
