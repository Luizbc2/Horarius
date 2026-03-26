import type { LucideIcon } from "lucide-react";

type AuthFeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName: string;
};

export function AuthFeatureCard({
  icon: Icon,
  title,
  description,
  iconClassName,
}: AuthFeatureCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-[0_20px_50px_-34px_rgba(73,47,22,0.35)]">
      <div className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${iconClassName}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-xl text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
