// ============================================================================
// BREADCRUMB CONFIGURATION
// ============================================================================

import { Home, Building2, Users, FolderKanban, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
      href: (params) => `/dashboard/orgs/${params.id}`,
      isOrgSwitcher: true, // Renders as dropdown
    },
  ],

  // Single organisation (with switcher)
  "/dashboard/org/:id/team": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: (params) => params.id, // Will be replaced by org name
      href: (params) => `/dashboard/orgs/${params.id}`,
      isOrgSwitcher: true, // Renders as dropdown
    },
    {
      label: "Team",
    },
  ],

  // Single organisation (with switcher)
  "/dashboard/org/:id/products": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: (params) => params.id, // Will be replaced by org name
      href: (params) => `/dashboard/orgs/${params.id}`,
      isOrgSwitcher: true, // Renders as dropdown
    },
    {
      label: "Products",
    },
  ],

  // Single organisation (with switcher)
  "/dashboard/org/:id/categories": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: (params) => params.id, // Will be replaced by org name
      href: (params) => `/dashboard/orgs/${params.id}`,
      isOrgSwitcher: true, // Renders as dropdown
    },
    {
      label: "Products",
    },
  ],

  // Organisation customers
  "/dashboard/orgs/:orgId/customers": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: (params) => params.orgId,
      icon: Building2,
      href: (params) => `/dashboard/orgs/${params.orgId}`,
      isOrgSwitcher: true,
    },
    {
      label: "Customers",
      icon: Users,
      href: (params) => `/dashboard/orgs/${params.orgId}/customers`,
    },
  ],

  // New customer
  "/dashboard/orgs/:orgId/customers/new": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: (params) => params.orgId,
      icon: Building2,
      href: (params) => `/dashboard/orgs/${params.orgId}`,
      isOrgSwitcher: true,
    },
    {
      label: "Customers",
      icon: Users,
      href: (params) => `/dashboard/orgs/${params.orgId}/customers`,
    },
    { label: "New Customer", icon: Plus },
  ],

  // Organisation projects
  "/dashboard/orgs/:orgId/projects": [
    { label: "Dashboard", icon: Home, href: "/dashboard", hidden: true },
    {
      label: (params) => params.orgId,
      icon: Building2,
      href: (params) => `/dashboard/orgs/${params.orgId}`,
      isOrgSwitcher: true,
    },
    {
      label: "Projects",
      icon: FolderKanban,
      href: (params) => `/dashboard/orgs/${params.orgId}/projects`,
    },
  ],

  // Auth routes (simple)
  "/auth/signin": [{ label: "Sign In" }],

  "/auth/signup": [{ label: "Create Account" }],
};

// Match route pattern to config
export function matchBreadcrumbConfig(pathname: string): {
  config: BreadcrumbSegment[];
  params: Record<string, string>;
} | null {
  for (const [pattern, config] of Object.entries(breadcrumbsConfig)) {
    const params = matchRoute(pattern, pathname);
    if (params) {
      return { config, params };
    }
  }
  return null;
}

// Simple route matcher
function matchRoute(
  pattern: string,
  pathname: string,
): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);

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
