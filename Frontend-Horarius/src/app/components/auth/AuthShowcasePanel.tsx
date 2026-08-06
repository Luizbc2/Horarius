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
  return (
    <section className="hidden min-h-[42rem] overflow-hidden rounded-lg bg-[#8f2449] p-7 text-white lg:grid lg:grid-rows-[auto_1fr] xl:p-9">
      <div>
        <BrandLockup inverse />
      </div>

      <div className="mt-10 grid min-h-0 gap-8 xl:grid-cols-[0.72fr_1.28fr] xl:items-center">
        <div className="max-w-md self-center">
          <p className="text-xs font-bold uppercase text-[#d7f75b]">{eyebrow}</p>
          <h1 className="mt-4 max-w-[13ch] text-4xl font-medium leading-[1.08] text-white xl:text-5xl">{title}</h1>
          <p className="mt-4 text-sm leading-6 text-white/68 xl:text-base xl:leading-7">{description}</p>
          <div className="mt-8 flex items-center gap-5 border-t border-white/15 pt-5">
            <div>
              <p className="font-[var(--font-display)] text-3xl font-medium">08</p>
              <p className="mt-1 text-xs text-white/55">atendimentos hoje</p>
            </div>
            <div className="h-10 w-px bg-white/15" />
            <div>
              <p className="font-[var(--font-display)] text-3xl font-medium">82%</p>
              <p className="mt-1 text-xs text-white/55">ocupação da equipe</p>
            </div>
          </div>
        </div>

        <div className="self-center overflow-hidden rounded-lg border border-black/10 bg-[#f8f9fb] text-[#181a20] shadow-[0_28px_70px_-32px_rgba(21,22,38,0.65)] dark:border-white/10 dark:bg-[#17161a] dark:text-[#f6f6f8]">
          <header className="flex items-center justify-between border-b border-black/8 px-5 py-4 dark:border-white/10">
            <div>
              <p className="text-xs font-semibold text-[#6b6f7b] dark:text-[#a9acb5]">QUINTA-FEIRA</p>
              <h2 className="mt-1 text-2xl font-medium">Agenda de hoje</h2>
            </div>
            <button type="button" aria-label="Mais opções" className="flex h-9 w-9 items-center justify-center rounded-md border border-black/10 bg-white text-[#6b6f7b] dark:border-white/10 dark:bg-[#211f24] dark:text-[#a9acb5]">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </header>

          <div className="grid grid-cols-[minmax(0,1fr)_8.5rem]">
            <div className="divide-y divide-black/[0.07] px-5 dark:divide-white/[0.08]">
              {appointments.map((appointment) => (
                <div key={appointment.time} className="grid grid-cols-[3.25rem_1fr] gap-3 py-4">
                  <p className="pt-1 text-xs font-bold text-[#6b6f7b] dark:text-[#a9acb5]">{appointment.time}</p>
                  <div className="border-l-2 border-[#a72c53] pl-3 dark:border-[#df5c86]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold">{appointment.client}</p>
                        <p className="mt-1 text-xs text-[#6b6f7b] dark:text-[#a9acb5]">{appointment.service}</p>
                      </div>
                      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${appointment.color}`} />
                    </div>
                    <p className="mt-2 inline-flex items-center gap-1 text-[0.68rem] font-semibold text-[#a72c53] dark:text-[#ef82a5]">
                      <Check className="h-3 w-3" /> {appointment.status}
                    </p>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-[3.25rem_1fr] gap-3 py-4">
                <p className="pt-1 text-xs font-bold text-[#6b6f7b] dark:text-[#a9acb5]">14:30</p>
                <div className="rounded-md border border-dashed border-[#a72c53]/35 bg-[#a72c53]/5 px-3 py-2 text-xs font-semibold text-[#a72c53] dark:border-[#df5c86]/40 dark:bg-[#df5c86]/10 dark:text-[#ef82a5]">
                  Horário disponível
                </div>
              </div>
            </div>

            <aside className="border-l border-black/[0.07] bg-white px-4 py-5 dark:border-white/[0.08] dark:bg-[#1d1b1f]">
              <p className="text-[0.68rem] font-bold uppercase text-[#6b6f7b] dark:text-[#a9acb5]">Resumo</p>
              <div className="mt-5 space-y-5">
                <div>
                  <CalendarDays className="h-4 w-4 text-[#a72c53] dark:text-[#ef82a5]" />
                  <p className="mt-2 text-lg font-extrabold">8</p>
                  <p className="text-[0.68rem] text-[#6b6f7b] dark:text-[#a9acb5]">agendados</p>
                </div>
                <div>
                  <Clock3 className="h-4 w-4 text-[#ff7051]" />
                  <p className="mt-2 text-lg font-extrabold">2h</p>
                  <p className="text-[0.68rem] text-[#6b6f7b] dark:text-[#a9acb5]">livres</p>
                </div>
                <div>
                  <UserRound className="h-4 w-4 text-[#2f8f89]" />
                  <p className="mt-2 text-lg font-extrabold">4</p>
                  <p className="text-[0.68rem] text-[#6b6f7b] dark:text-[#a9acb5]">profissionais</p>
                </div>
              </div>
              <div className="mt-6 border-t border-black/[0.07] pt-4 dark:border-white/[0.08]">
                <p className="flex items-center gap-1 text-[0.68rem] font-bold text-[#4f7d16] dark:text-[#b9df65]">
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
