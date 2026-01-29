// ============================================================================
// BREADCRUMB COMPONENT
// ============================================================================

import { GalleryVerticalEnd, SlashIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import { matchBreadcrumbConfig } from "@/lib/breadcrumbs-config";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import TeamSwitcher from "@/components/team-switcher";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface BreadcrumbProps {
  maxDepth?: number; // Future: collapse after this depth
}

export function Breadcrumbs() {
  const location = useLocation();

  const match = matchBreadcrumbConfig(location.pathname);

  if (!match)
    return (
      <Breadcrumb>
        <BreadcrumbList className="gap-1 sm:gap-1.5">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard/organisations">
                <GalleryVerticalEnd className="size-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
        </BreadcrumbList>
      </Breadcrumb>
    ); // No breadcrumb config for this route

  const { config, params } = match;

  // Filter out hidden segments
  const visibleSegments = config.filter((segment) => !segment.hidden);

  // Resolve dynamic values
  const resolvedSegments = visibleSegments.map((segment) => ({
    ...segment,
    label:
      typeof segment.label === "function"
        ? segment.label(params)
        : segment.label,
    href: segment.href
      ? typeof segment.href === "function"
        ? segment.href(params)
        : segment.href
      : undefined,
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1 sm:gap-1.5">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard/organisations">
              <GalleryVerticalEnd className="size-4" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator>
          <SlashIcon />
        </BreadcrumbSeparator>

        {resolvedSegments.map((segment, index) => {
          const isLast = index === resolvedSegments.length - 1;
          const Icon = segment.icon;

          return (
            <Fragment key={index}>
              {/* Segment */}
              {segment.isOrgSwitcher ? (
                // Organisation switcher dropdown
                <BreadcrumbItem>
                  <TeamSwitcher currentId={params.id || ""} />
                </BreadcrumbItem>
              ) : segment.href && !isLast ? (
                // Clickable link
                <BreadcrumbLink asChild className="flex items-center gap-2">
                  <Link to={segment.href}>
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{segment.label}</span>
                  </Link>
                </BreadcrumbLink>
              ) : (
                // Current page (not clickable)
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{segment.label}</span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}

              {/* Separator */}
              {!isLast && (
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
