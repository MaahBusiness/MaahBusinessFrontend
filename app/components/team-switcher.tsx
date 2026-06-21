import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, BoringFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Link, Navigate, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { organisationKeys, organisationsApi } from "@/lib/api/organisation";
import { capitalizeFirstChar, extractImageUrl, genericErrorState } from "utils";
import { Skeleton } from "@/components/ui/skeleton";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {
  currentId: string;
}

export default function TeamSwitcher({ currentId }: TeamSwitcherProps) {
  const { user, accessToken } = useAuth();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const { data: res, isLoading } = useQuery({
    queryKey: organisationKeys.lists(),
    queryFn: async () => {
      if (!accessToken) return null;
      return await organisationsApi.getAll(accessToken);
    },
    enabled: !!accessToken,
  });

  const { data: membersRes, isLoading: membersLoading } = useQuery({
    queryKey: organisationKeys.members(currentId),
    queryFn: async () => {
      if (!accessToken) return null;
      return await organisationsApi.getMembers(accessToken, currentId);
    },
    enabled: !!accessToken && !!currentId,
  });

  if (isLoading && !res)
    return (
      <div className="flex h-8 min-w-[10rem] items-center gap-2">
        <Skeleton className="size-5 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );

  if (!res?.success)
    return (
      <div className="flex h-8 min-w-[10rem] items-center gap-2">
        <Skeleton className="size-5 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );

  const selected =
    res?.data?.find((d) => d.id === currentId) || res?.data?.at(0);

  const businessUser =
    selected?.members?.find((m) => m.user?.id === user?.id) ??
    membersRes?.data?.find((m) => m.user?.id === user?.id) ??
    (user?.id && selected?.owner_id === user.id
      ? membersRes?.data?.find((m) => m.role === "owner")
      : undefined);

  if (
    selected &&
    !membersLoading &&
    membersRes !== undefined &&
    !businessUser &&
    user?.id !== selected.owner_id
  ) {
    return <Navigate to="/dashboard/organisations" replace />;
  }

  const role =
    businessUser?.role ??
    (user?.id === selected?.owner_id ? ("owner" as const) : undefined);

  return (
    <div className="flex items-center gap-1">
      <Link
        to={`/dashboard/org/${selected?.id}/home`}
        className="flex items-center gap-2 transition-colors hover:text-foreground"
      >
        <Avatar className="h-5 w-5">
          <AvatarImage
            src={extractImageUrl(selected?.logo_url ?? "") ?? undefined}
            alt={selected?.unique_name}
            // className="grayscale"
          />
          <BoringFallback name={selected?.unique_name} />
        </Avatar>
        <span className="text-xxs tablet:text-sm">{selected?.name} </span>
        <Badge variant="secondary" className="text-[10px] tablet:text-xxs">
          {role && capitalizeFirstChar(role)}
        </Badge>
      </Link>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="w-6 -mr-1">
            <ChevronsUpDown className="opacity-75 size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="center">
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
                      onSelect={() => navigate(`/dashboard/org/${team.id}/home`)}
                      key={team.id}
                      className="text-xs"
                    >
                      <Avatar className="mr-1 h-5 w-5">
                        <AvatarImage
                          // src={team.logo_url}
                          src={
                            extractImageUrl(team?.logo_url ?? "") ?? undefined
                          }
                          alt={team.unique_name}
                          // className="grayscale"
                        />
                        <BoringFallback name={team.unique_name} />
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
