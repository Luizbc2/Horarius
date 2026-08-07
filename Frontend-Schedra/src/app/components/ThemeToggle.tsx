import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "./ui/button";
import { cn } from "./ui/utils";

type ThemeToggleProps = {
  inverse?: boolean;
  showLabel?: boolean;
  className?: string;
};

export function ThemeToggle({ inverse = false, showLabel = false, className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={isDark ? "Tema claro" : "Tema escuro"}
      className={cn(
        "h-10 w-10",
        showLabel && "w-full justify-start px-3",
        inverse && "border-white/12 bg-white/[0.06] text-white shadow-none hover:border-white/20 hover:bg-white/10",
        className,
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel ? <span>{isDark ? "Tema claro" : "Tema escuro"}</span> : null}
    </Button>
  );
}
