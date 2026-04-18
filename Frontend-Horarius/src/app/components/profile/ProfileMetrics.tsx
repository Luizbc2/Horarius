import { Mail, ShieldCheck, UserRound } from "lucide-react";

import { MetricCard } from "../PageShell";

type ProfileMetricsProps = {
  passwordStatus: string;
};

export function ProfileMetrics({ passwordStatus }: ProfileMetricsProps) {
  return (
    <div className="metric-grid">
      <MetricCard
        label="Conta ativa"
        value="Em uso"
        helper="Você está editando os dados da conta que está logada agora."
        icon={<UserRound className="h-5 w-5" />}
      />
      <MetricCard
        label="E-mail protegido"
        value="Somente leitura"
        helper="O e-mail fica visível para consulta, mas não pode ser trocado por aqui."
        icon={<Mail className="h-5 w-5" />}
        accent="sand"
      />
      <MetricCard
        label="Nova senha"
        value={passwordStatus}
        helper="Preencha e confirme os campos abaixo quando quiser trocar sua senha."
        icon={<ShieldCheck className="h-5 w-5" />}
        accent="coral"
      />
    </div>
  );
}
