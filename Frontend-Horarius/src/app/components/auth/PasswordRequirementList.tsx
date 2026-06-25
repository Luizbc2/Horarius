import { CheckCircle2, Circle } from "lucide-react";

import { getPasswordRequirements } from "../../lib/field-rules";

type PasswordRequirementListProps = {
  password: string;
};

export function PasswordRequirementList({ password }: PasswordRequirementListProps) {
  const requirements = getPasswordRequirements(password);

  return (
    <div className="rounded-xl border border-border/70 bg-background/55 p-3 shadow-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        {requirements.map((requirement) => {
          const Icon = requirement.met ? CheckCircle2 : Circle;

          return (
            <div
              key={requirement.id}
              className={
                requirement.met
                  ? "flex items-center gap-2 text-xs font-medium text-emerald-700"
                  : "flex items-center gap-2 text-xs font-medium text-muted-foreground"
              }
            >
              <Icon className={requirement.met ? "h-4 w-4 text-emerald-600" : "h-4 w-4"} />
              <span>{requirement.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
