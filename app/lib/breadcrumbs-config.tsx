// ============================================================================
// BREADCRUMB CONFIGURATION
// ============================================================================

import { Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** 
WILDCARD PATTERN MATCHING:

Using `/*` allows one config to match ALL nested routes!

Example 1: Match all product routes \
`"/dashboard/organizations/:orgId/products/*": [...]`

This matches:
```
✅ /dashboard/organizations/123/products
✅ /dashboard/organizations/123/products/new
✅ /dashboard/organizations/123/products/456
✅ /dashboard/organizations/123/products/456/edit
✅ /dashboard/organizations/123/products/456/variants/789
```

Example 2: Match all customer routes
`"/dashboard/organizations/:orgId/customers/*": [...]`

This matches:
```
✅ /dashboard/organizations/123/customers
✅ /dashboard/organizations/123/customers/new
✅ /dashboard/organizations/123/customers/456
✅ /dashboard/organizations/123/customers/456/orders
```

PRIORITY SYSTEM: \
1. Exact matches first (no wildcard)
2. Wildcards second (sorted by specificity)

So you can have both:
```
"/dashboard/organizations/:orgId/products/new": [...]  // Exact - higher priority
"/dashboard/organizations/:orgId/products/*": [...]    // Wildcard - lower priority
```

The "new" route will use its specific config,
all other product routes use the wildcard config.

@USAGE :

Define top-level only:
```ts
"/dashboard/organizations/:orgId/products/*": [
  { label: "Dashboard", hidden: true },
  { label: (params) => params.orgId, isOrgSwitcher: true },
  { label: "Products" },
]
  ```

All these routes automatically use the same breadcrumb:
```
- /dashboard/organizations/123/products
- /dashboard/organizations/123/products/new
- /dashboard/organizations/123/products/456/edit
- /dashboard/organizations/123/products/456/variants
```

NO NEED to define each nested route separately!
*/

export interface BreadcrumbSegment {
  label: string | ((params: Record<string, string>) => string);
  icon?: LucideIcon;
  href?: string | ((params: Record<string, string>) => string);
  isOrgSwitcher?: boolean; // Special case for org dropdown
  hidden?: boolean; // Don't show this segment
}

export interface BreadcrumbConfig {
  [pattern: string]: BreadcrumbSegment[];
}

// Route pattern matching with dynamic segments
export const breadcrumbsConfig: BreadcrumbConfig = {
  // Dashboard home
  "/dashboard": [{ label: "Dashboard", icon: Home, href: "/dashboard" }],

  // Organisations list
  "/dashboard/organisations": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: "Organisations",
      href: "/dashboard/organisations",
    },
  ],

  // New organisation
  "/dashboard/organisations/new": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: "Organisations",
      href: "/dashboard/organisations",
    },
    { label: "New Organisation" },
  ],

  // Add team members (after creating org)
  "/dashboard/organisations/add-team": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: "Organisations",
      href: "/dashboard/organisations",
    },
    { label: "New Organisation" },
    { label: "Add Team" },
  ],

  // Single organisation (with switcher)
  "/dashboard/org/:id": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: (params) => params.id, // Will be replaced by org name
      href: (params) => `/dashboard/org/${params.id}`,
      isOrgSwitcher: true, // Renders as dropdown
    },
  ],

  // Single organisation (with switcher)
  "/dashboard/org/:id/team": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: (params) => params.id, // Will be replaced by org name
      href: (params) => `/dashboard/org/${params.id}`,
      isOrgSwitcher: true, // Renders as dropdown
    },
    {
      label: "Team",
    },
  ],

  // ALL products routes (top-level + nested)
  "/dashboard/org/:id/products/*": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: (params) => params.id, // Will be replaced by org name
      href: (params) => `/dashboard/org/${params.id}`,
      isOrgSwitcher: true, // Renders as dropdown
    },
    {
      label: "Products",
    },
  ],

  // ALL products routes (top-level + nested)
  "/dashboard/org/:id/invoices/*": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: (params) => params.id, // Will be replaced by org name
      href: (params) => `/dashboard/org/${params.id}`,
      isOrgSwitcher: true, // Renders as dropdown
    },
    {
      label: "Sales & Invoices",
    },
  ],

  // Auth routes (simple)
  "/auth/signin": [{ label: "Sign In" }],

  "/auth/signup": [{ label: "Create Account" }],
};

// Match route pattern to config (with wildcard support)
export function matchBreadcrumbConfig(pathname: string): {
  config: BreadcrumbSegment[];
  params: Record<string, string>;
} | null {
  // Sort patterns to prioritize exact matches over wildcards
  const sortedPatterns = Object.entries(breadcrumbsConfig).sort((a, b) => {
    const aHasWildcard = a[0].includes("*");
    const bHasWildcard = b[0].includes("*");

    // Exact matches first
    if (!aHasWildcard && bHasWildcard) return -1;
    if (aHasWildcard && !bHasWildcard) return 1;

    // Longer patterns first (more specific)
    return b[0].length - a[0].length;
  });

  for (const [pattern, config] of sortedPatterns) {
    const params = matchRoute(pattern, pathname);
    if (params) {
      return { config, params };
    }
  }
  return null;
}

// Simple route matcher with wildcard support
function matchRoute(
  pattern: string,
  pathname: string,
): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

  // Check for wildcard pattern (e.g., /products/*)
  const hasWildcard = pattern.endsWith("/*");

  if (hasWildcard) {
    // Remove the wildcard from pattern
    const basePatternParts = patternParts.slice(0, -1);

    // Path must be at least as long as base pattern
    if (pathParts.length < basePatternParts.length) {
      return null;
    }

    // Match base pattern parts
    const params: Record<string, string> = {};

    for (let i = 0; i < basePatternParts.length; i++) {
      const patternPart = basePatternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(":")) {
        // Dynamic segment
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Static segment doesn't match
        return null;
      }
    }

    return params;
  }

  // Exact match (no wildcard)
  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(":")) {
      // Dynamic segment
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      // Static segment doesn't match
      return null;
    }
  }

  return params;
}
