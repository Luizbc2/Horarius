import type { LucideIcon } from "lucide-react";

import { AuthFeatureCard } from "./AuthFeatureCard";

type AuthFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName: string;
};

type AuthShowcasePanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  features: AuthFeature[];
};

export function AuthShowcasePanel({
  eyebrow,
  title,
  description,
  features,
}: AuthShowcasePanelProps) {
  return (
    <section className="surface-panel flex min-h-[24rem] flex-col justify-between overflow-hidden rounded-[2rem] p-6 lg:p-8">
      <div className="max-w-2xl animate-fade-up">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="page-title mt-5 max-w-xl">{title}</h1>
        <p className="page-description mt-5 max-w-xl">{description}</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <AuthFeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
