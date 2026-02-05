import { Avatar, BoringFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-context";
import { Link, useNavigation, useSubmit } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { extractImageUrl } from "utils";
import { User } from "lucide-react";

export function UserNav() {
  const { setTheme, theme } = useTheme();
  const submit = useSubmit();
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");

  const isSigningOut = isSubmitting && intent === "signout";

  if (!isAuthenticated) return;

  const themes = ["Dark", "Light", "System"];

  const handleSignOut = () => {
    submit({ intent: "signout" }, { method: "POST" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={extractImageUrl(user?.avatar_url ?? "") ?? ""}
              alt={user?.name}
            />
            <BoringFallback name={user?.name} />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 text-xs" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {user?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link to={"profile"}>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>
                <User />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e as "dark" | "light" | "system")}
        >
          {themes.map((theme, id) => (
            <DropdownMenuRadioItem
              className="outline-0 text-xs"
              key={theme + id}
              value={theme.toLocaleLowerCase()}
            >
              {theme}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleSignOut();
            // your logic
          }}
          // onClick={handleSignOut}
          disabled={isSigningOut}
        >
          Log out
          <DropdownMenuShortcut>
            {isSigningOut && <Spinner className="size-3" />}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
