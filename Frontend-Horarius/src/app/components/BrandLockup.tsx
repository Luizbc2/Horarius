import { brand } from "../config/brand";
import { cn } from "./ui/utils";

type BrandLockupProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

export function BrandLockup({ compact = false, inverse = false, className }: BrandLockupProps) {
  if (compact) {
    return <span className="sr-only">{brand.name}</span>;
  }

  return (
    <div className={cn("min-w-0", className)}>
      <p className={cn("font-[var(--font-display)] text-xl font-semibold leading-none", inverse ? "text-white" : "text-foreground")}>
        {brand.name}
      </p>
      <p className={cn("mt-1 text-[0.68rem] font-medium", inverse ? "text-white/55" : "text-muted-foreground")}>
        {brand.descriptor}
      </p>
    </div>
  );
}
