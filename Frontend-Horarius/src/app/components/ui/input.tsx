import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/90 selection:bg-primary selection:text-primary-foreground border-white/70 flex h-11 w-full min-w-0 rounded-[1rem] border bg-input-background px-4 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_44px_-28px_rgba(70,47,28,0.32)] backdrop-blur transition-[color,box-shadow,border-color,transform] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
