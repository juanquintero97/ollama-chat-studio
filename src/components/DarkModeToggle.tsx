import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function DarkModeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isDark ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="light-mode" className="text-sm cursor-pointer">
              Light
            </Label>
            <Switch
              id="light-mode"
              checked={theme === "light"}
              onCheckedChange={() => setTheme("light")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-sm cursor-pointer">
              Dark
            </Label>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={() => setTheme("dark")}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="system-mode" className="text-sm cursor-pointer">
              System
            </Label>
            <Switch
              id="system-mode"
              checked={theme === "system"}
              onCheckedChange={() => setTheme("system")}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}