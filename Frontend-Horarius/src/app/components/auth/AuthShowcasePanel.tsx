import { CalendarCheck2, type LucideIcon } from "lucide-react";

import { brand } from "../../config/brand";
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

export function AuthShowcasePanel({ eyebrow, title, description, features }: AuthShowcasePanelProps) {
  return (
    <section className="surface-panel--dark hidden min-h-[31rem] flex-col justify-between overflow-hidden rounded-lg p-6 lg:flex lg:p-9">
      <div>
        <div className="flex items-center gap-3 border-b border-white/10 pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#42b8ad] text-[#071b19]">
            <CalendarCheck2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-white">{brand.name}</p>
            <p className="text-xs text-white/45">{brand.descriptor}</p>
          </div>
        </div>

        <div className="mt-10 max-w-2xl animate-fade-up">
          <span className="text-xs font-bold uppercase text-[#6ed2c8]">{eyebrow}</span>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight text-white lg:text-5xl">{title}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/58">{description}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-3 md:grid-cols-3">
        {features.map((feature) => <AuthFeatureCard key={feature.title} {...feature} />)}
      </div>
    </section>
  );
}
