import { CheckCircle2, Circle } from "lucide-react";

import { getPasswordRequirements } from "../../lib/field-rules";

type PasswordRequirementListProps = {
  password: string;
};

export function PasswordRequirementList({ password }: PasswordRequirementListProps) {
  const requirements = getPasswordRequirements(password);

  return (
    <div className="rounded-2xl border border-border/70 bg-background/55 px-3 py-2 shadow-sm" aria-live="polite">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {requirements.map((requirement) => {
          const Icon = requirement.met ? CheckCircle2 : Circle;

          return (
            <div
              key={requirement.id}
              className={
                requirement.met
                  ? "inline-flex min-w-[8.5rem] items-center gap-1.5 text-xs font-medium text-emerald-700"
                  : "inline-flex min-w-[8.5rem] items-center gap-1.5 text-xs font-medium text-muted-foreground"
              }
            >
              <Icon className={requirement.met ? "h-3.5 w-3.5 text-emerald-600" : "h-3.5 w-3.5"} />
              <span>{requirement.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
