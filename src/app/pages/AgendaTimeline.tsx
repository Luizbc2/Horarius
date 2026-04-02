import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import {
  CalendarCheck2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MoreVertical,
  RefreshCw,
  Users,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { EmptyStatePanel, MetricCard, PageShell, SectionCard } from "../components/PageShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { cn } from "../components/ui/utils";
import { loadProfessionals, type Professional } from "../data/professionals";

type AppointmentStatus = "confirmado" | "pendente" | "cancelado";

type Appointment = {
  id: number;
  time: string;
  client: string;
  service: string;
  professionalId: string;
  status: AppointmentStatus;
  durationInMinutes: number;
};

const DAY_START_HOUR = 9;
const DAY_END_HOUR = 19;
const SLOT_INTERVAL_MINUTES = 10;
const SLOT_HEIGHT = 22;

const statusStyles: Record<
  AppointmentStatus,
  { card: string; badge: string; label: string }
> = {
  confirmado: {
    card: "border-emerald-300 bg-emerald-100/85",
    badge: "border-emerald-300 bg-emerald-50 text-emerald-800",
    label: "Confirmado",
  },
  pendente: {
    card: "border-amber-300 bg-amber-100/90",
    badge: "border-amber-300 bg-amber-50 text-amber-800",
    label: "Pendente",
  },
  cancelado: {
    card: "border-rose-300 bg-rose-100/85",
    badge: "border-rose-300 bg-rose-50 text-rose-700",
    label: "Cancelado",
  },
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function padTime(value: number) {
  return String(value).padStart(2, "0");
}

function generateTimeSlots() {
  const slots: string[] = [];
  const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;

  for (let minutes = 0; minutes < totalMinutes; minutes += SLOT_INTERVAL_MINUTES) {
    const hour = DAY_START_HOUR + Math.floor(minutes / 60);
    const minute = minutes % 60;
    slots.push(`${padTime(hour)}:${padTime(minute)}`);
  }

  return slots;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function createTimelineAppointments(professionals: Professional[]): Appointment[] {
  if (professionals.length === 0) {
    return [];
  }

  const [firstProfessional, secondProfessional] = professionals;

  return [
    {
      id: 1,
      time: "09:00",
      client: "Murilo Pereira Macedo",
      service: "Corte + barba",
      professionalId: String(firstProfessional.id),
      status: "confirmado",
      durationInMinutes: 60,
    },
    {
      id: 2,
      time: "09:50",
      client: "Pedro Santos",
      service: "Barba",
      professionalId: String(firstProfessional.id),
      status: "confirmado",
      durationInMinutes: 30,
    },
    {
      id: 3,
      time: "10:30",
      client: "Marcos Lima",
      service: "Corte",
      professionalId: String(firstProfessional.id),
      status: "confirmado",
      durationInMinutes: 30,
    },
    {
      id: 4,
      time: "11:10",
      client: "Rafael Costa",
      service: "Sobrancelha",
      professionalId: String(firstProfessional.id),
      status: "pendente",
      durationInMinutes: 30,
    },
    ...(secondProfessional
      ? [
          {
            id: 5,
            time: "09:30",
            client: "Juliana Barros",
            service: "Escova",
            professionalId: String(secondProfessional.id),
            status: "confirmado" as const,
            durationInMinutes: 40,
          },
          {
            id: 6,
            time: "11:00",
            client: "Carla Souza",
            service: "Corte feminino",
            professionalId: String(secondProfessional.id),
            status: "pendente" as const,
            durationInMinutes: 50,
          },
        ]
      : []),
  ];
}

export function AgendaTimeline() {
  const [selectedDate, setSelectedDate] = useState(new Date("2026-04-01T10:00:00"));
  const [selectedProfessional, setSelectedProfessional] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [draggedAppointmentId, setDraggedAppointmentId] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  useEffect(() => {
    setProfessionals(loadProfessionals());
  }, []);

  useEffect(() => {
    setAppointments((currentAppointments) => {
      if (currentAppointments.length > 0) {
        return currentAppointments;
      }

      return createTimelineAppointments(professionals);
    });
  }, [professionals]);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const visibleProfessionals = useMemo(() => {
    if (selectedProfessional === "todos") {
      return professionals;
    }

    return professionals.filter((professional) => String(professional.id) === selectedProfessional);
  }, [professionals, selectedProfessional]);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        if (selectedProfessional !== "todos" && appointment.professionalId !== selectedProfessional) {
          return false;
        }

        if (selectedStatus !== "todos" && appointment.status !== selectedStatus) {
          return false;
        }

        return true;
      }),
    [appointments, selectedProfessional, selectedStatus, professionals],
  );

  const appointmentsByProfessional = useMemo(() => {
    const grouped = new Map<string, Appointment[]>();

    for (const professional of visibleProfessionals) {
      grouped.set(String(professional.id), []);
    }

    for (const appointment of filteredAppointments) {
      if (!grouped.has(appointment.professionalId)) {
        continue;
      }

      grouped.get(appointment.professionalId)?.push(appointment);
    }

    for (const appointments of grouped.values()) {
      appointments.sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));
    }

    return grouped;
  }, [filteredAppointments, visibleProfessionals]);

  const confirmedCount = filteredAppointments.filter((appointment) => appointment.status === "confirmado").length;
  const pendingCount = filteredAppointments.filter((appointment) => appointment.status === "pendente").length;
  const occupancyBase = visibleProfessionals.length * timeSlots.length;
  const occupancy = occupancyBase > 0 ? Math.round((filteredAppointments.length / occupancyBase) * 100) : 0;

  const timelineGridStyle = {
    gridTemplateRows: `repeat(${timeSlots.length}, ${SLOT_HEIGHT}px)`,
  } satisfies CSSProperties;

  const formatTitleDate = (date: Date) =>
    date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const previousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const today = () => {
    setSelectedDate(new Date());
  };

  const handleDropAppointment = (professionalId: string, time: string) => {
    if (draggedAppointmentId === null) {
      return;
    }

    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === draggedAppointmentId
          ? {
              ...appointment,
              professionalId,
              time,
            }
          : appointment,
      ),
    );

    setDraggedAppointmentId(null);
    setDragOverSlot(null);
  };

  return (
    <PageShell
      eyebrow="Agenda"
      title="Timeline do dia"
      description="Visualize os horários lado a lado por profissional e acompanhe os encaixes do dia com mais clareza."
      actions={
        <>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4" />
            Recarregar
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/agenda/lista">Ver lista completa</Link>
          </Button>
        </>
      }
    >
      <div className="metric-grid">
        <MetricCard
          label="Atendimentos do dia"
          value={String(filteredAppointments.length)}
          helper="Blocos ocupados na timeline atual."
          icon={<CalendarCheck2 className="h-5 w-5" />}
        />
        <MetricCard
          label="Confirmados"
          value={String(confirmedCount)}
          helper="Clientes já confirmados."
          icon={<Users className="h-5 w-5" />}
          accent="sand"
        />
        <MetricCard
          label="Ocupação"
          value={`${occupancy}%`}
          helper={`${pendingCount} pendente${pendingCount === 1 ? "" : "s"} no momento.`}
          icon={<Clock3 className="h-5 w-5" />}
          accent="coral"
        />
      </div>

      <SectionCard
        title="Controles da agenda"
        description="Troque o dia, filtre por profissional e mantenha a leitura do quadro bem objetiva."
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="icon" onClick={previousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={today}>
                <CalendarDays className="h-4 w-4" />
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={nextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-3xl text-foreground capitalize">{formatTitleDate(selectedDate)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{selectedDate.toLocaleDateString("pt-BR")}</p>
            </div>

            <Button variant="outline">
              <RefreshCw className="h-4 w-4" />
              Recarregar
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-base text-foreground">Barbeiros:</span>
            <Button
              variant={selectedProfessional === "todos" ? "default" : "outline"}
              onClick={() => setSelectedProfessional("todos")}
            >
              Todos
            </Button>
            {professionals.map((professional) => (
              <Button
                key={professional.id}
                variant={selectedProfessional === String(professional.id) ? "default" : "outline"}
                onClick={() => setSelectedProfessional(String(professional.id))}
              >
                {professional.name}
              </Button>
            ))}

            <span className="ml-2 text-base text-foreground">Status:</span>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Grade da agenda"
        description="Cada coluna representa um profissional e os cartões entram na altura exata do horário agendado."
      >
        {professionals.length === 0 ? (
          <EmptyStatePanel
            icon={<Users className="h-7 w-7" />}
            title="Nenhum profissional disponível"
            description="Cadastre pelo menos um profissional para montar a timeline da agenda com colunas reais."
          />
        ) : visibleProfessionals.length === 0 ? (
          <EmptyStatePanel
            icon={<Clock3 className="h-7 w-7" />}
            title="Nenhum profissional nesse filtro"
            description="Ajuste o filtro de barbeiros para voltar a exibir as colunas da agenda."
          />
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/52 shadow-[0_24px_55px_-34px_rgba(73,47,22,0.28)]">
            <div className="overflow-x-auto">
              <div
                className="min-w-[980px]"
                style={{
                  display: "grid",
                  gridTemplateColumns: `100px repeat(${visibleProfessionals.length}, minmax(320px, 1fr))`,
                }}
              >
                <div className="border-b border-r border-[rgba(74,52,34,0.08)] bg-white/70 px-4 py-4 text-sm font-medium text-foreground">
                  Hora
                </div>

                {visibleProfessionals.map((professional) => (
                  <div
                    key={professional.id}
                    className="border-b border-r border-[rgba(74,52,34,0.08)] bg-white/70 px-4 py-4 last:border-r-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(74,52,34,0.08)] text-sm font-semibold text-foreground">
                        {getInitials(professional.name)}
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-foreground">{professional.name}</p>
                        <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-r border-[rgba(74,52,34,0.08)] bg-white/45">
                  <div className="grid" style={timelineGridStyle}>
                    {timeSlots.map((time) => {
                      const shouldLabel = Number(time.split(":")[1]) % 30 === 0;

                      return (
                        <div
                          key={time}
                          className="border-b border-[rgba(74,52,34,0.08)] px-4 text-sm text-muted-foreground"
                        >
                          {shouldLabel ? time : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {visibleProfessionals.map((professional) => {
                  const columnAppointments = appointmentsByProfessional.get(String(professional.id)) ?? [];

                  return (
                    <div
                      key={`column-${professional.id}`}
                      className="relative border-r border-[rgba(74,52,34,0.08)] bg-white/35 last:border-r-0"
                    >
                      <div className="grid" style={timelineGridStyle}>
                        {timeSlots.map((time) => (
                          <div
                            key={`${professional.id}-${time}-slot`}
                            className={cn(
                              "border-b border-[rgba(74,52,34,0.08)] transition-colors",
                              dragOverSlot === `${professional.id}-${time}` ? "bg-primary/10" : "",
                            )}
                            onDragOver={(event) => {
                              event.preventDefault();
                              setDragOverSlot(`${professional.id}-${time}`);
                            }}
                            onDragLeave={() => {
                              setDragOverSlot((current) =>
                                current === `${professional.id}-${time}` ? null : current,
                              );
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              handleDropAppointment(String(professional.id), time);
                            }}
                          />
                        ))}
                      </div>

                      <div
                        className="absolute inset-0 grid px-2 py-0.5"
                        style={timelineGridStyle}
                      >
                        {columnAppointments.map((appointment) => {
                          const startIndex = Math.max(
                            0,
                            Math.floor(
                              (timeToMinutes(appointment.time) - DAY_START_HOUR * 60) / SLOT_INTERVAL_MINUTES,
                            ),
                          );
                          const rowSpan = Math.max(
                            1,
                            Math.ceil(appointment.durationInMinutes / SLOT_INTERVAL_MINUTES),
                          );

                          return (
                            <div
                              key={appointment.id}
                              style={{
                                gridRow: `${startIndex + 1} / span ${rowSpan}`,
                              }}
                              className={cn(
                                "mx-0.5 my-[2px] cursor-grab rounded-[1rem] border px-3 py-2 shadow-[0_16px_35px_-28px_rgba(73,47,22,0.45)] active:cursor-grabbing",
                                statusStyles[appointment.status].card,
                                draggedAppointmentId === appointment.id ? "opacity-60" : "",
                              )}
                              draggable
                              onDragStart={() => {
                                setDraggedAppointmentId(appointment.id);
                              }}
                              onDragEnd={() => {
                                setDraggedAppointmentId(null);
                                setDragOverSlot(null);
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-lg font-semibold text-foreground">{appointment.time}</p>
                                  <p className="truncate text-base text-foreground">{appointment.client}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">{appointment.service}</p>
                                </div>
                                <button
                                  type="button"
                                  className="text-muted-foreground transition hover:text-foreground"
                                  aria-label="Ações do agendamento"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="mt-2">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                                    statusStyles[appointment.status].badge,
                                  )}
                                >
                                  {statusStyles[appointment.status].label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
