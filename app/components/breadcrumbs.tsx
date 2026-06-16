import { SlashIcon } from "lucide-react";
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

export function Breadcrumbs() {
  const location = useLocation();
  const match = matchBreadcrumbConfig(location.pathname);

  if (!match) {
    return (
      <Breadcrumb>
        <BreadcrumbList className="gap-1 sm:gap-1.5">
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-medium">
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const { config, params } = match;
  const visibleSegments = config.filter((segment) => !segment.hidden);

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
        {resolvedSegments.map((segment, index) => {
          const isLast = index === resolvedSegments.length - 1;
          const Icon = segment.icon;

          return (
            <Fragment key={index}>
              {segment.isOrgSwitcher ? (
                <BreadcrumbItem>
                  <TeamSwitcher currentId={params.id || ""} />
                </BreadcrumbItem>
              ) : segment.href && !isLast ? (
                <BreadcrumbLink asChild className="flex items-center gap-2">
                  <Link to={segment.href}>
                    {Icon && <Icon className="size-4" />}
                    <span>{segment.label}</span>
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2 text-sm font-medium">
                    {Icon && <Icon className="size-4" />}
                    <span>{segment.label}</span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}

              {!isLast && (
                <BreadcrumbSeparator>
                  <SlashIcon className="text-muted-foreground" />
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
