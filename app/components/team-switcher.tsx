import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link, redirect, useLocation, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbLink } from "@/components/ui/breadcrumb";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { capitalizeFirstChar, genericErrorState } from "utils";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {
  currentId: string;
}

export default function TeamSwitcher({ currentId }: TeamSwitcherProps) {
  const { user, accessToken } = useAuth(); // Get token from context
  const [open, setOpen] = React.useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Fetch all organisations for the switcher dropdown
  const { data: res, isLoading } = useQuery({
    queryKey: organisationKeys.lists(),
    queryFn: async () => {
      if (!accessToken)
        throw redirect(
          `/auth/signin?redirectTo=${encodeURIComponent(pathname)}`,
        );
      return await organisationsApi.getAll(accessToken);
    },
    enabled: !!accessToken, // Only run if token exists
  });

  if (isLoading || !res?.success)
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-12" />
        <Spinner className="size-4 text-muted-foreground" />
      </div>
    );

  const selected =
    res?.data?.find((d) => d.id === currentId) || res?.data?.at(0);
  // Roundabout way to get the user's role in the current organisation
  const businessUser = selected?.members?.find((m) => m.user?.id === user?.id);

  if (selected && !businessUser) {
    throw redirect("/dashboard/organisations/");
    throw new Error(
      "You must be a member of this organisation to access this page",
    );
  }

  return (
    <div className="flex items-center gap-1">
      <BreadcrumbLink asChild>
        <Link to={`org/${selected?.id}`} className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage
              src={selected?.logo_url}
              alt={selected?.unique_name}
              className="grayscale"
            />
            <AvatarFallback name={selected?.unique_name} />
          </Avatar>
          <span>{selected?.name} </span>
          <Badge variant="secondary" className="text-xxs">
            {businessUser?.role && capitalizeFirstChar(businessUser?.role)}
          </Badge>
        </Link>
      </BreadcrumbLink>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="w-6 -mr-1">
            <ChevronsUpDown className="opacity-75 size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search orgs..." />
            <CommandList>
              <CommandEmpty>No team found.</CommandEmpty>

              {isLoading && <TeamSwitcherSkeleton />}

              {!res?.success && (
                <CommandEmpty>{genericErrorState().message}</CommandEmpty>
              )}

              {!res?.data && <CommandEmpty>No team found.</CommandEmpty>}

              {res?.data && (
                <CommandGroup heading={"Organisations"} className="text-xs">
                  {res.data.map((team) => (
                    // <Link to={`org/${team.id}`} key={team.id}>
                    <CommandItem
                      onSelect={() => navigate(`org/${team.id}`)}
                      key={team.id}
                      className="text-xs"
                    >
                      <Avatar className="mr-1 h-5 w-5">
                        <AvatarImage
                          src={team.logo_url}
                          alt={team.unique_name}
                          className="grayscale"
                        />
                        <AvatarFallback name={team.unique_name} />
                      </Avatar>
                      {team.name}
                      <Check
                        className={cn(
                          "ml-auto",
                          selected?.id === team.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                    // </Link>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <Link to={"organisations/new"}>
                  <CommandItem>
                    <PlusCircle className="h-5 w-5" />
                    Create organisation
                  </CommandItem>
                </Link>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function TeamSwitcherSkeleton() {
  return (
    <CommandGroup>
      {[0, 1, 2].map((i, dx) => (
        <CommandItem
          key={dx}
          className="text-sm h-8 w-full bg-accent animate-pulse"
        >
          <div className=""></div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
