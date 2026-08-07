import { CalendarDays, Check, Clock3, MoreHorizontal, TrendingUp, UserRound } from "lucide-react";

import { BrandLockup } from "../BrandLockup";

type AuthShowcasePanelProps = {
  eyebrow: string;
  title: string;
  description: string;
};

const appointments = [
  { time: "09:00", client: "Camila Rocha", service: "Corte + finalização", status: "Confirmado", color: "bg-[#d7f75b]" },
  { time: "10:30", client: "Lucas Martins", service: "Barba completa", status: "Em atendimento", color: "bg-[#ff7051]" },
  { time: "13:00", client: "Marina Alves", service: "Coloração", status: "Confirmado", color: "bg-[#2f8f89]" },
];

export function AuthShowcasePanel({ eyebrow, title, description }: AuthShowcasePanelProps) {
  const hasLongTitle = title.length > 46;

  return (
    <section className="auth-showcase relative hidden h-full min-h-0 overflow-hidden rounded-lg bg-[#96244c] p-10 text-white xl:block 2xl:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-52 h-[34rem] w-[34rem] rounded-full border border-[#d5a64d]/55" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-44 h-[30rem] w-[30rem] rounded-full border-[3rem] border-white/[0.025]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rotate-45 border border-white/15" />

      <BrandLockup inverse className="relative z-10" />

      <div className="auth-showcase-layout relative z-10 mt-16 grid grid-cols-[minmax(14rem,0.68fr)_minmax(28rem,1.32fr)] items-start gap-8 2xl:mt-20 2xl:grid-cols-[minmax(18rem,0.66fr)_minmax(38rem,1.34fr)] 2xl:gap-10">
        <div className="auth-showcase-copy max-w-[25rem] pb-2">
          <p className="text-xs font-bold uppercase text-[#d7f75b]">{eyebrow}</p>
          <h1
            className={`auth-showcase-title ${
              hasLongTitle
                ? "mt-5 max-w-[12ch] text-5xl font-medium leading-[1.03] text-white 2xl:text-6xl"
                : "mt-5 max-w-[8ch] text-6xl font-medium leading-[1.01] text-white 2xl:text-7xl"
            }`}
          >
            {title}
          </h1>
          <p className="auth-showcase-description mt-6 max-w-[24rem] text-base leading-8 text-white/74">{description}</p>
          <div className="auth-showcase-stats mt-10 flex items-center gap-7 border-t border-white/20 pt-6">
            <div>
              <p className="font-[var(--font-display)] text-4xl font-medium">08</p>
              <p className="mt-1 text-xs text-white/62">atendimentos hoje</p>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div>
              <p className="font-[var(--font-display)] text-4xl font-medium">82%</p>
              <p className="mt-1 text-xs text-white/62">ocupação da equipe</p>
            </div>
          </div>
        </div>

        <div className="auth-agenda-preview w-full translate-y-5 overflow-hidden rounded-lg border border-black/15 bg-[#f8f9fb] text-[#181a20] shadow-[0_32px_80px_-30px_rgba(18,10,15,0.72)] dark:border-white/10 dark:bg-[#17161a] dark:text-[#f6f6f8] 2xl:translate-y-7">
          <header className="auth-agenda-header flex items-center justify-between border-b border-black/8 px-6 py-5 dark:border-white/10">
            <div>
              <p className="text-xs font-semibold text-[#6b6f7b] dark:text-[#a9acb5]">QUINTA-FEIRA · VISÃO DO DIA</p>
              <h2 className="auth-agenda-title mt-2 text-3xl font-medium">Agenda inteligente</h2>
            </div>
            <button type="button" aria-label="Mais opções" className="flex h-11 w-11 items-center justify-center rounded-md border border-black/10 bg-white text-[#6b6f7b] dark:border-white/10 dark:bg-[#211f24] dark:text-[#a9acb5]">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </header>

          <div className="grid grid-cols-[minmax(0,1fr)_9.5rem]">
            <div className="divide-y divide-black/[0.07] px-6 dark:divide-white/[0.08]">
              {appointments.map((appointment) => (
                <div key={appointment.time} className="auth-agenda-row grid grid-cols-[3.5rem_1fr] gap-4 py-5">
                  <p className="pt-1 text-sm font-bold text-[#6b6f7b] dark:text-[#a9acb5]">{appointment.time}</p>
                  <div className="border-l-2 border-[#a72c53] pl-4 dark:border-[#df5c86]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-bold">{appointment.client}</p>
                        <p className="mt-1 text-sm text-[#6b6f7b] dark:text-[#a9acb5]">{appointment.service}</p>
                      </div>
                      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${appointment.color}`} />
                    </div>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#a72c53] dark:text-[#ef82a5]">
                      <Check className="h-3 w-3" /> {appointment.status}
                    </p>
                  </div>
                </div>
              ))}
              <div className="auth-agenda-row grid grid-cols-[3.5rem_1fr] gap-4 py-5">
                <p className="pt-1 text-sm font-bold text-[#6b6f7b] dark:text-[#a9acb5]">14:30</p>
                <div className="rounded-md border border-dashed border-[#a72c53]/35 bg-[#a72c53]/5 px-4 py-2.5 text-sm font-semibold text-[#a72c53] dark:border-[#df5c86]/40 dark:bg-[#df5c86]/10 dark:text-[#ef82a5]">
                  Horário disponível
                </div>
              </div>
            </div>

            <aside className="auth-agenda-summary border-l border-black/[0.07] bg-white px-5 py-6 dark:border-white/[0.08] dark:bg-[#1d1b1f]">
              <p className="text-[0.68rem] font-bold uppercase text-[#6b6f7b] dark:text-[#a9acb5]">Resumo</p>
              <div className="mt-6 space-y-6">
                <div>
                  <CalendarDays className="h-4 w-4 text-[#a72c53] dark:text-[#ef82a5]" />
                  <p className="mt-2 text-xl font-extrabold">8</p>
                  <p className="text-xs text-[#6b6f7b] dark:text-[#a9acb5]">agendados</p>
                </div>
                <div>
                  <Clock3 className="h-4 w-4 text-[#ff7051]" />
                  <p className="mt-2 text-xl font-extrabold">2h</p>
                  <p className="text-xs text-[#6b6f7b] dark:text-[#a9acb5]">livres</p>
                </div>
                <div>
                  <UserRound className="h-4 w-4 text-[#2f8f89]" />
                  <p className="mt-2 text-xl font-extrabold">4</p>
                  <p className="text-xs text-[#6b6f7b] dark:text-[#a9acb5]">profissionais</p>
                </div>
              </div>
              <div className="mt-7 border-t border-black/[0.07] pt-5 dark:border-white/[0.08]">
                <p className="flex items-center gap-1 text-xs font-bold text-[#4f7d16] dark:text-[#b9df65]">
                  <TrendingUp className="h-3.5 w-3.5" /> +12% na semana
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
