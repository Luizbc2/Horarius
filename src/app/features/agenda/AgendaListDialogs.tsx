import type { Dispatch, SetStateAction } from "react";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  getStatusLabel,
  type AgendaListItem,
  type EditAppointmentDraft,
} from "./list-helpers";
import type { ClientApiItem } from "../../services/clients";
import type { ProfessionalApiItem } from "../../services/professionals";
import type { ServiceApiItem } from "../../services/services";
import type { AppointmentStatus } from "../../services/appointments";

type AgendaListDialogsProps = {
  clients: ClientApiItem[];
  detailsAppointment: AgendaListItem | null;
  editDraft: EditAppointmentDraft;
  editingAppointment: AgendaListItem | null;
  isDetailsDialogOpen: boolean;
  isEditDialogOpen: boolean;
  professionals: ProfessionalApiItem[];
  services: ServiceApiItem[];
  setEditDraft: Dispatch<SetStateAction<EditAppointmentDraft>>;
  onCloseDetailsDialog: () => void;
  onCloseEditDialog: () => void;
  onSaveAppointmentEdit: () => void;
};

export function AgendaListDialogs({
  clients,
  detailsAppointment,
  editDraft,
  editingAppointment,
  isDetailsDialogOpen,
  isEditDialogOpen,
  professionals,
  services,
  setEditDraft,
  onCloseDetailsDialog,
  onCloseEditDialog,
  onSaveAppointmentEdit,
}: AgendaListDialogsProps) {
  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => (!open ? onCloseEditDialog() : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar atendimento</DialogTitle>
            <DialogDescription>
              Ajuste cliente, serviço, horário e profissional sem sair da lista.
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
              <Label htmlFor="agenda-edit-service">Serviço</Label>
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
                  <SelectValue placeholder="Escolha o serviço" />
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
                <Label htmlFor="agenda-edit-time">Horário</Label>
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
            <Button variant="outline" onClick={onCloseEditDialog}>
              Cancelar
            </Button>
            <Button onClick={onSaveAppointmentEdit} disabled={!editingAppointment}>
              Salvar mudanças
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={(open) => (!open ? onCloseDetailsDialog() : undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resumo do atendimento</DialogTitle>
            <DialogDescription>
              Confira as informações antes de editar, confirmar ou cancelar.
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
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Serviço</p>
                  <p className="mt-1 text-base text-foreground">{detailsAppointment.service}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                  <p className="mt-1 text-base text-foreground">{getStatusLabel(detailsAppointment.status)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Data</p>
                  <p className="mt-1 text-base text-foreground">{detailsAppointment.date}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Horário</p>
                  <p className="mt-1 text-base text-foreground">{detailsAppointment.time}</p>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={onCloseDetailsDialog}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
