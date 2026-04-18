import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1rem] text-sm font-semibold tracking-[0.01em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border border-primary/20 bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_78%,black))] text-primary-foreground shadow-[0_18px_40px_-20px_rgba(31,109,104,0.9)] hover:-translate-y-0.5 hover:brightness-105",
        destructive:
          "border border-destructive/20 bg-destructive text-white shadow-[0_18px_40px_-20px_rgba(201,95,85,0.8)] hover:-translate-y-0.5 hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-white/70 bg-white/72 text-foreground shadow-[0_18px_45px_-24px_rgba(70,47,28,0.28)] backdrop-blur hover:-translate-y-0.5 hover:border-white hover:bg-white dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "border border-[#dccab5]/55 bg-secondary/90 text-secondary-foreground shadow-[0_18px_45px_-26px_rgba(123,87,51,0.3)] hover:-translate-y-0.5 hover:bg-secondary",
        ghost:
          "text-foreground hover:bg-white/65 hover:text-accent-foreground hover:shadow-[0_16px_32px_-24px_rgba(73,47,22,0.55)] dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-[0.9rem] gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-12 rounded-[1.15rem] px-7 has-[>svg]:px-5",
        icon: "size-11 rounded-[1rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
