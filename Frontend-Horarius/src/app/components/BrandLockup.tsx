import { brand } from "../config/brand";
import { cn } from "./ui/utils";

type BrandLockupProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

export function BrandLockup({ compact = false, inverse = false, className }: BrandLockupProps) {
  return (
    <div className={cn("flex items-center gap-3", compact && "justify-center", className)}>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-[var(--font-display)] text-lg font-extrabold",
          inverse ? "bg-[#d7f75b] text-[#181a20]" : "bg-primary text-white",
        )}
        aria-hidden="true"
      >
        S
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className={cn("text-lg font-extrabold leading-none", inverse ? "text-white" : "text-foreground")}>
            {brand.name}
          </p>
          <p className={cn("mt-1 text-[0.68rem] font-medium", inverse ? "text-white/55" : "text-muted-foreground")}>
            {brand.descriptor}
          </p>
        </div>
      ) : null}
    </div>
  );
}
