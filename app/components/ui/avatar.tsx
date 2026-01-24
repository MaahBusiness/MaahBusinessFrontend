import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as BAV from "boring-avatars";

import { cn } from "@/lib/utils";
import type { AvatarProps } from "boring-avatars/dist/components/types";

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
function BoringFallback({
  className,
  variant,
  colors,
  name,
  title,
  size,
  square,
  ...props
}: Partial<AvatarProps> & {
  variant?:
    | "pixel"
    | "bauhaus"
    | "ring"
    | "beam"
    | "sunset"
    | "marble"
    | "geometric"
    | "abstract";
}) {
  const Boring = BAV.default;

  return (
    <Boring
      name={name}
      {...{ variant, colors, title, size, square, ...props }}
      className={cn(
        "bg-muted flex size-full items-center justify-center",
        className,
      )}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, BoringFallback };
