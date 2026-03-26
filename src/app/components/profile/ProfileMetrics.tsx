import { Mail, ShieldCheck, UserRound } from "lucide-react";

import { MetricCard } from "../PageShell";

type ProfileMetricsProps = {
  passwordStatus: string;
};

export function ProfileMetrics({ passwordStatus }: ProfileMetricsProps) {
  return (
    <div className="metric-grid">
      <MetricCard
        label="Conta logada"
        value="Ativa"
        helper="Esses dados aparecem no painel da conta atual."
        icon={<UserRound className="h-5 w-5" />}
      />
      <MetricCard
        label="E-mail"
        value="Bloqueado"
        helper="O e-mail do cadastro é exibido só para consulta."
        icon={<Mail className="h-5 w-5" />}
        accent="sand"
      />
      <MetricCard
        label="Nova senha"
        value={passwordStatus}
        helper="Preencha os dois campos abaixo para confirmar a troca."
        icon={<ShieldCheck className="h-5 w-5" />}
        accent="coral"
      />
    </div>
  );
}
