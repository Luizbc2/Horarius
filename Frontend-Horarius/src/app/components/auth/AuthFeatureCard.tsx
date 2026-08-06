import type { LucideIcon } from "lucide-react";

type AuthFeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName: string;
};

export function AuthFeatureCard({ icon: Icon, title, description, iconClassName }: AuthFeatureCardProps) {
  return (
    <article className="border-t border-white/12 pt-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md ${iconClassName}`}>
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="mt-3 text-sm font-bold text-white">{title}</h2>
      <p className="mt-1.5 text-xs leading-5 text-white/48">{description}</p>
    </article>
  );
}
