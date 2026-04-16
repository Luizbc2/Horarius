import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Search,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
import { MetricCard, PageShell, SectionCard } from "../components/PageShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  ITEMS_PER_PAGE,
  buildScheduledAt,
  createEditAppointmentDraft,
  filterAppointments,
  formatAppointmentForList,
  getStatusColor,
  getStatusLabel,
  getTodayDateValue,
  type AgendaListItem,
  type EditAppointmentDraft,
} from "../features/agenda/list-helpers";
import { getApiErrorMessage, isMissingAuthTokenError } from "../lib/api-error";
import { createProfessionalsService, type ProfessionalApiItem } from "../services/professionals";
import {
  createAppointmentsService,
  type AppointmentStatus,
} from "../services/appointments";
import { createClientsService, type ClientApiItem } from "../services/clients";
import { createServicesService, type ServiceApiItem } from "../services/services";

export function AgendaLista() {
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayDateValue);
  const [selectedProfessional, setSelectedProfessional] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState<ClientApiItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalApiItem[]>([]);
  const [services, setServices] = useState<ServiceApiItem[]>([]);
  const [appointments, setAppointments] = useState<AgendaListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AgendaListItem | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [detailsAppointment, setDetailsAppointment] = useState<AgendaListItem | null>(null);
  const [editDraft, setEditDraft] = useState<EditAppointmentDraft>(createEditAppointmentDraft());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) {
      setClients([]);
      setProfessionals([]);
      setServices([]);
      return;
    }

    let isMounted = true;

    const loadSupportData = async () => {
      try {
        const [clientsResponse, servicesResponse, professionalsResponse] = await Promise.all([
          createClientsService(token).list({ page: 1, limit: 200 }),
          createServicesService(token).list({ page: 1, limit: 200 }),
          createProfessionalsService(token).list({ page: 1, limit: 200 }),
        ]);

        if (!isMounted) {
          return;
        }

        setClients(clientsResponse.data);
        setServices(servicesResponse.data);
        setProfessionals(professionalsResponse.data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (!isMissingAuthTokenError(error)) {
          toast.error(
            getApiErrorMessage(error, "Nao foi possivel carregar clientes, profissionais e servicos."),
          );
        }
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
      setIsLoading(true);

      try {
        const appointmentsService = createAppointmentsService(token);
        const response = await appointmentsService.list({
          date: selectedDate,
          limit: 200,
          page: 1,
          professionalId:
            selectedProfessional !== "todos" ? Number(selectedProfessional) : undefined,
          status: selectedStatus !== "todos" ? (selectedStatus as AppointmentStatus) : undefined,
        });

        if (!isMounted) {
          return;
        }

        setAppointments(response.data.map(formatAppointmentForList));
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
          setIsLoading(false);
        }
      }
    };

    void loadAppointments();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, selectedDate, selectedProfessional, selectedStatus, token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate, selectedProfessional, selectedStatus]);

  const filteredAppointments = useMemo(
    () => filterAppointments(appointments, searchTerm),
    [appointments, searchTerm],
  );
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const confirmedCount = filteredAppointments.filter((appointment) => appointment.status === "confirmado").length;
  const pendingCount = filteredAppointments.filter((appointment) => appointment.status === "pendente").length;

  const handleRefresh = () => {
    setRefreshKey((currentKey) => currentKey + 1);
  };

  const resetEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingAppointment(null);
    setEditDraft(createEditAppointmentDraft());
  };

  const resetDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setDetailsAppointment(null);
  };

  const openEditDialog = (appointment: AgendaListItem) => {
    setEditingAppointment(appointment);
    setEditDraft(createEditAppointmentDraft(appointment));
    setIsEditDialogOpen(true);
  };

  const openDetailsDialog = (appointment: AgendaListItem) => {
    setDetailsAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleSaveAppointmentEdit = async () => {
    if (!editingAppointment) {
      return;
    }

    if (!token) {
      toast.error("Sua sessao expirou. Entre novamente para continuar.");
      return;
    }

    const clientId = Number(editDraft.clientId);
    const professionalId = Number(editDraft.professionalId);
    const serviceId = Number(editDraft.serviceId);

    if (!clientId || !professionalId || !serviceId) {
      toast.error("Selecione cliente, profissional e servico.");
      return;
    }

    try {
      const appointmentsService = createAppointmentsService(token);
      const response = await appointmentsService.update(editingAppointment.id, {
        clientId,
        professionalId,
        serviceId,
        scheduledAt: buildScheduledAt(editingAppointment.scheduledAt, editDraft.time),
        status: editDraft.status,
        notes: editingAppointment.notes,
      });

      setAppointments((currentAppointments) =>
        currentAppointments.map((currentAppointment) =>
          currentAppointment.id === editingAppointment.id
            ? formatAppointmentForList(response.appointment)
            : currentAppointment,
        ),
      );

      toast.success(response.message);
      resetEditDialog();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Nao foi possivel atualizar o agendamento."));
    }
  };

  const handleUpdateAppointmentStatus = async (
    appointment: AgendaListItem,
    status: AppointmentStatus,
  ) => {
    if (!token) {
      toast.error("Sua sessao expirou. Entre novamente para continuar.");
      return;
    }

    const appointmentsService = createAppointmentsService(token);

    try {
      const response = await appointmentsService.update(appointment.id, {
        clientId: appointment.clientId,
        professionalId: appointment.professionalId,
        serviceId: appointment.serviceId,
        scheduledAt: appointment.scheduledAt,
        status,
        notes: appointment.notes,
      });

      setAppointments((currentAppointments) =>
        currentAppointments.map((currentAppointment) =>
          currentAppointment.id === appointment.id
            ? {
                ...currentAppointment,
                status: response.appointment.status,
              }
            : currentAppointment,
        ),
      );

      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Nao foi possivel atualizar o agendamento."));
    }
  };

  const handleDeleteAppointment = async (appointment: AgendaListItem) => {
    if (!token) {
      toast.error("Sua sessao expirou. Entre novamente para continuar.");
      return;
    }

    try {
      const appointmentsService = createAppointmentsService(token);
      const response = await appointmentsService.remove(appointment.id);

      setAppointments((currentAppointments) =>
        currentAppointments.filter((currentAppointment) => currentAppointment.id !== appointment.id),
      );

      toast.success(response.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Nao foi possivel excluir o agendamento."));
    }
  };

  return (
    <PageShell
      eyebrow="Gestao diaria"
      title="Lista de agendamentos"
      description="Filtre a operacao por profissional, status e busca textual para encontrar rapidamente qualquer atendimento do dia."
      actions={
        <>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Recarregar
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/agenda/timeline">Abrir timeline</Link>
          </Button>
        </>
      }
    >
      <div className="metric-grid">
        <MetricCard
          label="Agendamentos filtrados"
          value={String(filteredAppointments.length)}
          helper="Volume dentro dos filtros ativos"
          icon={<CalendarRange className="h-5 w-5" />}
        />
        <MetricCard
          label="Confirmados"
          value={String(confirmedCount)}
          helper="Clientes validados para atendimento"
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="sand"
        />
        <MetricCard
          label="Pendentes"
          value={String(pendingCount)}
          helper="Agendamentos aguardando retorno"
          icon={<TimerReset className="h-5 w-5" />}
          accent="coral"
        />
      </div>

      <SectionCard
        title="Filtros e resultados"
        description="Combine data, profissional e status para reduzir a lista e agir mais rapido sobre cada atendimento."
      >
        <div className="grid gap-3 lg:grid-cols-[1.05fr_1fr_1fr_1.2fr_auto]">
          <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />

          <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
            <SelectTrigger>
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos profissionais</SelectItem>
              {professionals.map((professional) => (
                <SelectItem key={professional.id} value={String(professional.id)}>
                  {professional.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar cliente, servico ou profissional"
              className="pl-11"
            />
          </div>

          <Button variant="outline" className="w-full lg:w-auto" onClick={handleRefresh}>
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/52 shadow-[0_24px_55px_-34px_rgba(73,47,22,0.28)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data e hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servico</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[96px] text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      Carregando agendamentos...
                    </TableCell>
                  </TableRow>
                ) : paginatedAppointments.length > 0 ? (
                  paginatedAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{appointment.date}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            {appointment.time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{appointment.client}</TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>{appointment.professional}</TableCell>
                      <TableCell>
                        <span
                          className={`${getStatusColor(appointment.status)} inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openDetailsDialog(appointment)}>
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openEditDialog(appointment)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => void handleUpdateAppointmentStatus(appointment, "confirmado")}
                            >
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => void handleUpdateAppointmentStatus(appointment, "cancelado")}
                            >
                              Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => void handleDeleteAppointment(appointment)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      Nenhum agendamento encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-[rgba(74,52,34,0.08)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {paginatedAppointments.length} de {filteredAppointments.length} agendamentos filtrados.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="data-pill text-sm">
                  Pagina {safePage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </SectionCard>
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => (!open ? resetEditDialog() : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar agendamento</DialogTitle>
            <DialogDescription>
              Ajuste cliente, profissional, servico, horario e status sem sair da lista.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agenda-edit-client">Cliente</Label>
              <Select
                value={editDraft.clientId}
                onValueChange={(value) =>
                  setEditDraft((currentDraft) => ({
                    ...currentDraft,
                    clientId: value,
                  }))
                }
              >
                <SelectTrigger id="agenda-edit-client">
                  <SelectValue placeholder="Escolha o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda-edit-service">Servico</Label>
              <Select
                value={editDraft.serviceId}
                onValueChange={(value) =>
                  setEditDraft((currentDraft) => ({
                    ...currentDraft,
                    serviceId: value,
                  }))
                }
              >
                <SelectTrigger id="agenda-edit-service">
                  <SelectValue placeholder="Escolha o servico" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={String(service.id)}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="agenda-edit-professional">Profissional</Label>
                <Select
                  value={editDraft.professionalId}
                  onValueChange={(value) =>
                    setEditDraft((currentDraft) => ({
                      ...currentDraft,
                      professionalId: value,
                    }))
                  }
                >
                  <SelectTrigger id="agenda-edit-professional">
                    <SelectValue placeholder="Escolha o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={String(professional.id)}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenda-edit-time">Horario</Label>
                <Input
                  id="agenda-edit-time"
                  type="time"
                  value={editDraft.time}
                  onChange={(event) =>
                    setEditDraft((currentDraft) => ({
                      ...currentDraft,
                      time: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda-edit-status">Status</Label>
              <Select
                value={editDraft.status}
                onValueChange={(value: AppointmentStatus) =>
                  setEditDraft((currentDraft) => ({
                    ...currentDraft,
                    status: value,
                  }))
                }
              >
                <SelectTrigger id="agenda-edit-status">
                  <SelectValue placeholder="Escolha o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetEditDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAppointmentEdit}>Salvar alteracoes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDetailsDialogOpen} onOpenChange={(open) => (!open ? resetDetailsDialog() : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do agendamento</DialogTitle>
            <DialogDescription>
              Veja os dados completos antes de editar ou confirmar.
            </DialogDescription>
          </DialogHeader>

          {detailsAppointment ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cliente</p>
                  <p className="mt-1 text-base text-foreground">{detailsAppointment.client}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profissional</p>
                  <p className="mt-1 text-base text-foreground">{detailsAppointment.professional}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Servico</p>
                  <p className="mt-1 text-base text-foreground">{detailsAppointment.service}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                  <p className="mt-1 text-base text-foreground">
                    {getStatusLabel(detailsAppointment.status)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Data</p>
                  <p className="mt-1 text-base text-foreground">{detailsAppointment.date}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Horario</p>
                  <p className="mt-1 text-base text-foreground">{detailsAppointment.time}</p>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={resetDetailsDialog}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}


