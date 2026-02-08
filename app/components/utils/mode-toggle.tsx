import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-context";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const themes = ["Dark", "Light", "System"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="focus-visible:ring-0 rounded-full"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 text-xs">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
