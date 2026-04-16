import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Toaster, toast } from "sonner";
import {
  CalendarCheck2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
import { EmptyStatePanel, MetricCard, PageShell, SectionCard } from "../components/PageShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { AgendaAppointmentDialogs } from "../features/agenda/AgendaAppointmentDialogs";
import { AgendaTimelineBoard } from "../features/agenda/AgendaTimelineBoard";
import {
  buildScheduledAt,
  createAppointmentDraft,
  createNewAppointmentDraft,
  formatDateForApi,
  generateTimeSlots,
  mapTimelineAppointment,
  SLOT_HEIGHT,
  timeToMinutes,
  type AppointmentDraft,
  type NewAppointmentDraft,
  type TimelineAppointment,
} from "../features/agenda/timeline-helpers";
import { getApiErrorMessage, isMissingAuthTokenError } from "../lib/api-error";
import { createProfessionalsService, type ProfessionalApiItem } from "../services/professionals";
import { createAppointmentsService } from "../services/appointments";
import { createClientsService, type ClientApiItem } from "../services/clients";
import { createServicesService, type ServiceApiItem } from "../services/services";
import type { AppointmentStatus } from "../types/entities";

export function AgendaTimeline() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [clients, setClients] = useState<ClientApiItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalApiItem[]>([]);
  const [services, setServices] = useState<ServiceApiItem[]>([]);
  const [appointments, setAppointments] = useState<TimelineAppointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [draggedAppointmentId, setDraggedAppointmentId] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [appointmentDraft, setAppointmentDraft] = useState<AppointmentDraft>(createAppointmentDraft());
  const [newAppointmentDraft, setNewAppointmentDraft] = useState<NewAppointmentDraft>(
    createNewAppointmentDraft(),
  );

  useEffect(() => {
    if (!token) {
      setProfessionals([]);
      return;
    }

    let isMounted = true;

    const loadProfessionals = async () => {
      try {
        const response = await createProfessionalsService(token).list({
          page: 1,
          limit: 200,
        });

        if (!isMounted) {
          return;
        }

        setProfessionals(response.data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (!isMissingAuthTokenError(error)) {
          toast.error(getApiErrorMessage(error, "Nao foi possivel carregar os profissionais."));
        }
      }
    };

    void loadProfessionals();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (searchParams.get("novo") === "1") {
      setIsCreateDialogOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isCreateDialogOpen) {
      return;
    }

    if (selectedProfessional === "todos") {
      return;
    }

    setNewAppointmentDraft((currentDraft) => ({
      ...currentDraft,
      professionalId: selectedProfessional,
    }));
  }, [isCreateDialogOpen, selectedProfessional]);

  useEffect(() => {
    if (!token) {
      setClients([]);
      setServices([]);
      return;
    }

    let isMounted = true;

    const loadSupportData = async () => {
      try {
        const [clientsResponse, servicesResponse] = await Promise.all([
          createClientsService(token).list({
            page: 1,
            limit: 200,
          }),
          createServicesService(token).list({
            page: 1,
            limit: 200,
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setClients(clientsResponse.data);
        setServices(servicesResponse.data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error(getApiErrorMessage(error, "Nao foi possivel carregar clientes e servicos."));
      }
    };

    void loadSupportData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAppointments([]);
      return;
    }

    let isMounted = true;

    const loadAppointments = async () => {
      setIsLoadingAppointments(true);

      try {
        const appointmentsService = createAppointmentsService(token);
        const response = await appointmentsService.list({
          date: formatDateForApi(selectedDate),
          limit: 200,
          page: 1,
          professionalId:
            selectedProfessional !== "todos" ? Number(selectedProfessional) : undefined,
          status: selectedStatus !== "todos" ? (selectedStatus as AppointmentStatus) : undefined,
        });

        if (!isMounted) {
          return;
        }

        setAppointments(response.data.map(mapTimelineAppointment));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAppointments([]);

        if (!isMissingAuthTokenError(error)) {
          toast.error(getApiErrorMessage(error, "Nao foi possivel carregar os agendamentos."));
        }
      } finally {
        if (isMounted) {
          setIsLoadingAppointments(false);
        }
      }
    };

    void loadAppointments();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedProfessional, selectedStatus, token, refreshKey]);

  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const timelineHeight = timeSlots.length * SLOT_HEIGHT;

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
    [appointments, selectedProfessional, selectedStatus],
  );

  const appointmentsByProfessional = useMemo(() => {
    const grouped = new Map<string, TimelineAppointment[]>();

    for (const professional of visibleProfessionals) {
      grouped.set(String(professional.id), []);
    }

    for (const appointment of filteredAppointments) {
      if (!grouped.has(appointment.professionalId)) {
        continue;
      }

      grouped.get(appointment.professionalId)?.push(appointment);
    }

    for (const appointmentList of grouped.values()) {
      appointmentList.sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));
    }

    return grouped;
  }, [filteredAppointments, visibleProfessionals]);

  const confirmedCount = filteredAppointments.filter((appointment) => appointment.status === "confirmado").length;
  const pendingCount = filteredAppointments.filter((appointment) => appointment.status === "pendente").length;
  const occupancyBase = visibleProfessionals.length * timeSlots.length;
  const occupancy = occupancyBase > 0 ? Math.round((filteredAppointments.length / occupancyBase) * 100) : 0;

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

  const resetCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);

      nextParams.delete("novo");

      return nextParams;
    });
    setNewAppointmentDraft(
      createNewAppointmentDraft(selectedProfessional !== "todos" ? selectedProfessional : ""),
    );
  };

  const resetEditDialog = () => {
    setEditingAppointmentId(null);
    setAppointmentDraft(createAppointmentDraft());
  };

  const handleCreateAppointment = () => {
    if (!token) {
      toast.error("Sua sessao expirou. Entre novamente para continuar.");
      return;
    }

    let clientId = Number(newAppointmentDraft.clientId);
    const serviceId = Number(newAppointmentDraft.serviceId);
    const professionalId = Number(newAppointmentDraft.professionalId);

    if (!serviceId || !professionalId) {
      toast.error("Selecione servico e profissional.");
      return;
    }

    if (!clientId) {
      if (!newAppointmentDraft.clientName.trim()) {
        toast.error("Informe o nome do cliente ou selecione um cliente existente.");
        return;
      }
    }

    const conflict = appointments.find(
      (appointment) =>
        appointment.professionalId === String(professionalId) &&
        appointment.time === newAppointmentDraft.time,
    );

    if (conflict) {
      toast.error("Ja existe um agendamento nesse horario.");
      return;
    }

    const appointmentsService = createAppointmentsService(token);
    const clientsService = createClientsService(token);

    const resolveClientId = async () => {
      if (clientId) {
        return clientId;
      }

      const createdClient = await clientsService.create({
        name: newAppointmentDraft.clientName.trim(),
        email: newAppointmentDraft.clientEmail.trim(),
        phone: newAppointmentDraft.clientPhone.trim(),
        cpf: newAppointmentDraft.clientCpf.trim(),
        notes: "",
      });

      clientId = createdClient.client.id;
      setClients((currentClients) => [...currentClients, createdClient.client]);

      return clientId;
    };

    void resolveClientId()
      .then((resolvedClientId) =>
        appointmentsService.create({
          clientId: resolvedClientId,
          professionalId,
          serviceId,
          scheduledAt: buildScheduledAt(selectedDate, newAppointmentDraft.time),
          status: newAppointmentDraft.status,
          notes: "",
        }),
      )
      .then((response) => {
        setAppointments((currentAppointments) => [
          ...currentAppointments,
          mapTimelineAppointment(response.appointment),
        ]);
        toast.success(response.message);
        resetCreateDialog();
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Nao foi possivel criar o agendamento."));
      });
  };

  const openEditDialog = (appointment: TimelineAppointment) => {
    setEditingAppointmentId(appointment.id);
    setAppointmentDraft({
      client: appointment.client,
      service: appointment.service,
      time: appointment.time,
      professionalId: appointment.professionalId,
      status: appointment.status,
    });
  };

  const handleDeleteAppointment = (appointmentId: number) => {
    if (!token) {
      toast.error("Sua sessao expirou. Entre novamente para continuar.");
      return;
    }

    const appointmentsService = createAppointmentsService(token);

    void appointmentsService
      .remove(appointmentId)
      .then((response) => {
        setAppointments((currentAppointments) =>
          currentAppointments.filter((appointment) => appointment.id !== appointmentId),
        );
        toast.success(response.message);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, "Nao foi possivel excluir o agendamento."));
      });
  };

  const handleDropAppointment = (professionalId: string, time: string) => {
    if (draggedAppointmentId === null) {
      return;
    }

    if (!token) {
      toast.error("Sua sessao expirou. Entre novamente para continuar.");
      setDraggedAppointmentId(null);
      setDragOverSlot(null);
      return;
    }

    const draggedAppointment = appointments.find((appointment) => appointment.id === draggedAppointmentId);

    if (!draggedAppointment) {
      setDraggedAppointmentId(null);
      setDragOverSlot(null);
      return;
    }

    const targetAppointment = appointments.find(
      (appointment) =>
        appointment.id !== draggedAppointmentId &&
        appointment.professionalId === professionalId &&
        appointment.time === time,
    );

    if (targetAppointment) {
      const previousAppointments = appointments;
      const nextAppointments = appointments.map((appointment) => {
        if (appointment.id === draggedAppointmentId) {
          return {
            ...appointment,
            professionalId: targetAppointment.professionalId,
            time: targetAppointment.time,
          };
        }

        if (appointment.id === targetAppointment.id) {
          return {
            ...appointment,
            professionalId: draggedAppointment.professionalId,
            time: draggedAppointment.time,
          };
        }

        return appointment;
      });

      setAppointments(nextAppointments);

      const appointmentsService = createAppointmentsService(token);

      void Promise.all([
        appointmentsService.update(draggedAppointment.id, {
          clientId: draggedAppointment.clientId,
          professionalId: Number(targetAppointment.professionalId),
          serviceId: draggedAppointment.serviceId,
          scheduledAt: buildScheduledAt(selectedDate, targetAppointment.time),
          status: draggedAppointment.status,
          notes: draggedAppointment.notes,
        }),
        appointmentsService.update(targetAppointment.id, {
          clientId: targetAppointment.clientId,
          professionalId: Number(draggedAppointment.professionalId),
          serviceId: targetAppointment.serviceId,
          scheduledAt: buildScheduledAt(selectedDate, draggedAppointment.time),
          status: targetAppointment.status,
          notes: targetAppointment.notes,
        }),
      ]).catch((error) => {
        setAppointments(previousAppointments);
        toast.error(getApiErrorMessage(error, "Nao foi possivel trocar os agendamentos."));
      });

      setDraggedAppointmentId(null);
      setDragOverSlot(null);
      return;
    }

    const targetStart = timeToMinutes(time);
    const targetEnd = targetStart + APPOINTMENT_DURATION_IN_MINUTES;
    const hasConflict = appointments.some((appointment) => {
      if (appointment.id === draggedAppointmentId || appointment.professionalId !== professionalId) {
        return false;
      }

      const appointmentStart = timeToMinutes(appointment.time);
      const appointmentEnd = appointmentStart + APPOINTMENT_DURATION_IN_MINUTES;

      return targetStart < appointmentEnd && targetEnd > appointmentStart;
    });

    if (hasConflict) {
      toast.error("Esse horario ja esta ocupado para esse profissional.");
      setDraggedAppointmentId(null);
      setDragOverSlot(null);
      return;
    }

    const previousAppointments = appointments;
    const nextAppointments = appointments.map((appointment) =>
      appointment.id === draggedAppointmentId
        ? {
            ...appointment,
            professionalId,
            time,
          }
        : appointment,
    );

    setAppointments(nextAppointments);

    const appointmentsService = createAppointmentsService(token);

    void appointmentsService
      .update(draggedAppointment.id, {
        clientId: draggedAppointment.clientId,
        professionalId: Number(professionalId),
        serviceId: draggedAppointment.serviceId,
        scheduledAt: buildScheduledAt(selectedDate, time),
        status: draggedAppointment.status,
        notes: draggedAppointment.notes,
      })
      .catch((error) => {
        setAppointments(previousAppointments);
        toast.error(getApiErrorMessage(error, "Nao foi possivel mover o agendamento."));
      });

    setDraggedAppointmentId(null);
    setDragOverSlot(null);
  };

  const handleSaveAppointmentEdit = () => {
    if (editingAppointmentId === null) {
      return;
    }

    if (!token) {
      toast.error("Sua sessao expirou. Entre novamente para continuar.");
      return;
    }

    const normalizedClient = appointmentDraft.client.trim();
    const normalizedService = appointmentDraft.service.trim();

    if (!normalizedClient || !normalizedService) {
      toast.error("Preencha cliente e servico.");
      return;
    }

    const conflict = appointments.find(
      (appointment) =>
        appointment.id !== editingAppointmentId &&
        appointment.professionalId === appointmentDraft.professionalId &&
        appointment.time === appointmentDraft.time,
    );

    if (conflict) {
      toast.error("Ja existe um agendamento nesse horario.");
      return;
    }

    const currentAppointment = appointments.find((appointment) => appointment.id === editingAppointmentId);

    if (!currentAppointment) {
      toast.error("Agendamento nao encontrado.");
      return;
    }

    const previousAppointments = appointments;
    const nextAppointments = appointments.map((appointment) =>
      appointment.id === editingAppointmentId
        ? {
            ...appointment,
            client: normalizedClient,
            service: normalizedService,
            time: appointmentDraft.time,
            professionalId: appointmentDraft.professionalId,
            status: appointmentDraft.status,
          }
        : appointment,
    );

    setAppointments(nextAppointments);
    resetEditDialog();

    const appointmentsService = createAppointmentsService(token);

    void appointmentsService
      .update(editingAppointmentId, {
        clientId: currentAppointment.clientId,
        professionalId: Number(appointmentDraft.professionalId),
        serviceId: currentAppointment.serviceId,
        scheduledAt: buildScheduledAt(selectedDate, appointmentDraft.time),
        status: appointmentDraft.status,
        notes: currentAppointment.notes,
      })
      .then((response) => {
        setAppointments((currentAppointments) =>
          currentAppointments.map((appointment) =>
            appointment.id === editingAppointmentId
              ? {
                  ...appointment,
                  client: response.appointment.clientName,
                  service: response.appointment.serviceName,
                  ...mapTimelineAppointment(response.appointment),
                }
              : appointment,
          ),
        );
        toast.success(response.message);
      })
      .catch((error) => {
        setAppointments(previousAppointments);
        toast.error(getApiErrorMessage(error, "Nao foi possivel atualizar o agendamento."));
      });
  };

  return (
    <PageShell
      eyebrow="Agenda"
      title="Timeline do dia"
      description="Visualize os horarios lado a lado por profissional e acompanhe os encaixes do dia com mais clareza."
      actions={
        <>
          <Button
            variant="default"
            onClick={() => {
              setSearchParams((currentParams) => {
                const nextParams = new URLSearchParams(currentParams);

                nextParams.set("novo", "1");

                return nextParams;
              });
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Novo agendamento
          </Button>
          <Button variant="outline" onClick={() => setRefreshKey((currentKey) => currentKey + 1)}>
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
          helper="Clientes ja confirmados."
          icon={<Users className="h-5 w-5" />}
          accent="sand"
        />
        <MetricCard
          label="Ocupacao"
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

            <Button variant="outline" onClick={() => setRefreshKey((currentKey) => currentKey + 1)}>
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
        description="Cada coluna representa um profissional e os cartoes entram na altura exata do horario agendado."
      >
        <AgendaTimelineBoard
          appointmentsByProfessional={appointmentsByProfessional}
          draggedAppointmentId={draggedAppointmentId}
          dragOverSlot={dragOverSlot}
          isLoadingAppointments={isLoadingAppointments}
          professionals={professionals}
          timeSlots={timeSlots}
          timelineHeight={timelineHeight}
          visibleProfessionals={visibleProfessionals}
          setDraggedAppointmentId={setDraggedAppointmentId}
          setDragOverSlot={setDragOverSlot}
          onDeleteAppointment={handleDeleteAppointment}
          onDropAppointment={handleDropAppointment}
          onEditAppointment={openEditDialog}
        />
      </SectionCard>
      <AgendaAppointmentDialogs
        appointmentDraft={appointmentDraft}
        clients={clients}
        editingAppointmentId={editingAppointmentId}
        isCreateDialogOpen={isCreateDialogOpen}
        newAppointmentDraft={newAppointmentDraft}
        professionals={professionals}
        services={services}
        setAppointmentDraft={setAppointmentDraft}
        setNewAppointmentDraft={setNewAppointmentDraft}
        timeSlots={timeSlots}
        onCloseCreateDialog={resetCreateDialog}
        onCreateAppointment={handleCreateAppointment}
        onOpenCreateDialog={() => {
          setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);

            nextParams.set("novo", "1");

            return nextParams;
          });
          setIsCreateDialogOpen(true);
        }}
        onResetEditDialog={resetEditDialog}
        onSaveAppointmentEdit={handleSaveAppointmentEdit}
      />
      <Toaster position="bottom-left" closeButton richColors />
    </PageShell>
  );
}


