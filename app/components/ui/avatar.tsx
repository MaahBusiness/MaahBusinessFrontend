import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function getAvatarInitials(name?: string | null): string {
  if (!name?.trim()) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return name.trim().slice(0, 2).toUpperCase();
}

function BoringFallback({
  className,
  name,
  variant: _variant,
  colors: _colors,
  title: _title,
  size: _size,
  square: _square,
  ...props
}: React.ComponentProps<typeof AvatarFallback> & {
  name?: string | null;
  variant?:
    | "pixel"
    | "bauhaus"
    | "ring"
    | "beam"
    | "sunset"
    | "marble"
    | "geometric"
    | "abstract";
  colors?: string[];
  title?: boolean;
  size?: number;
  square?: boolean;
}) {
  return (
    <AvatarFallback
      className={cn(
        "bg-muted text-muted-foreground text-[0.625rem] font-medium uppercase tracking-wide",
        className,
      )}
      {...props}
    >
      {getAvatarInitials(name)}
    </AvatarFallback>
  );
}

export { Avatar, AvatarImage, AvatarFallback, BoringFallback };
