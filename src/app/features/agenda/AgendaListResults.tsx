import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { getStatusColor, getStatusLabel, type AgendaListItem } from "./list-helpers";
import type { AppointmentStatus } from "../../services/appointments";

type AgendaListResultsProps = {
  appointments: AgendaListItem[];
  filteredCount: number;
  isLoading: boolean;
  safePage: number;
  totalPages: number;
  onDeleteAppointment: (appointment: AgendaListItem) => void;
  onEditAppointment: (appointment: AgendaListItem) => void;
  onNextPage: () => void;
  onOpenDetails: (appointment: AgendaListItem) => void;
  onPreviousPage: () => void;
  onUpdateAppointmentStatus: (appointment: AgendaListItem, status: AppointmentStatus) => void;
};

export function AgendaListResults({
  appointments,
  filteredCount,
  isLoading,
  safePage,
  totalPages,
  onDeleteAppointment,
  onEditAppointment,
  onNextPage,
  onOpenDetails,
  onPreviousPage,
  onUpdateAppointmentStatus,
}: AgendaListResultsProps) {
  return (
    <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/52 shadow-[0_24px_55px_-34px_rgba(73,47,22,0.28)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data e hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[96px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  Carregando seus agendamentos...
                </TableCell>
              </TableRow>
            ) : appointments.length > 0 ? (
              appointments.map((appointment) => (
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
                        <DropdownMenuItem onSelect={() => onOpenDetails(appointment)}>
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onEditAppointment(appointment)}>
                          Editar horário
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onUpdateAppointmentStatus(appointment, "confirmado")}>
                          Marcar como confirmado
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => onUpdateAppointmentStatus(appointment, "cancelado")}
                        >
                          Cancelar atendimento
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => onDeleteAppointment(appointment)}>
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
                  Nenhum atendimento encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredCount > 0 ? (
        <div className="flex flex-col gap-3 border-t border-[rgba(74,52,34,0.08)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Exibindo {appointments.length} de {filteredCount} agendamentos encontrados.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onPreviousPage} disabled={safePage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="data-pill text-sm">
              Página {safePage} de {totalPages}
            </span>
            <Button variant="outline" size="icon" onClick={onNextPage} disabled={safePage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
