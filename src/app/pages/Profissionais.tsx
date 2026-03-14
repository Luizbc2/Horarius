import { useEffect, useState, type FormEvent } from "react";
import { Ban, Clock3, Edit, Phone, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { Toaster, toast } from "sonner";

import { EmptyStatePanel, MetricCard, PageShell, SectionCard } from "../components/PageShell";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

type Professional = {
  id: number;
  name: string;
  avatar: string;
  specialties: string[];
  phone: string;
  schedule: string;
  status: "ativo" | "inativo";
  notes: string;
};

type ProfessionalFormData = {
  name: string;
  phone: string;
  specialties: string;
  schedule: string;
  notes: string;
};

type ProfessionalFormErrors = Partial<Record<keyof ProfessionalFormData, string>>;

const STORAGE_KEY = "horarius:profissionais";

const initialFormData: ProfessionalFormData = {
  name: "",
  phone: "",
  specialties: "",
  schedule: "",
  notes: "",
};

const defaultProfessionals = [
  {
    id: 1,
    name: "Joao",
    avatar: "J",
    specialties: ["Corte", "Barba", "Pigmentacao"],
    phone: "11987654321",
    schedule: "Seg a Sab, 09:00 as 19:00",
    status: "ativo",
    notes: "Atende cortes classicos, barba completa e finalizacao rapida.",
  },
] satisfies Professional[];

function loadProfessionals(): Professional[] {
  if (typeof window === "undefined") {
    return defaultProfessionals;
  }

  try {
    const storedProfessionals = window.localStorage.getItem(STORAGE_KEY);

    if (!storedProfessionals) {
      return defaultProfessionals;
    }

    const parsedProfessionals = JSON.parse(storedProfessionals) as Professional[];

    if (!Array.isArray(parsedProfessionals)) {
      return defaultProfessionals;
    }

    return parsedProfessionals.map((professional) => ({
      ...professional,
      schedule: typeof professional.schedule === "string" ? professional.schedule : "",
    }));
  } catch {
    return defaultProfessionals;
  }
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatPhone(value: string) {
  const digits = normalizePhone(value);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function parseSpecialties(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function buildAvatar(name: string) {
  const trimmedName = name.trim();
  return trimmedName ? trimmedName.charAt(0).toUpperCase() : "?";
}

function validateField(field: keyof ProfessionalFormData, value: string) {
  const trimmedValue = value.trim();

  if (field === "name" && !trimmedValue) {
    return "Informe o nome do profissional.";
  }

  if (field === "phone" && trimmedValue) {
    const digits = normalizePhone(trimmedValue);

    if (digits.length < 10) {
      return "Digite um telefone valido com 10 ou 11 numeros.";
    }
  }

  if (field === "specialties" && parseSpecialties(value).length === 0) {
    return "Adicione pelo menos uma especialidade.";
  }

  return "";
}

function validateFormData(formData: ProfessionalFormData) {
  const errors: ProfessionalFormErrors = {};

  (Object.keys(formData) as Array<keyof ProfessionalFormData>).forEach((field) => {
    const error = validateField(field, formData[field]);

    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

export function Profissionais() {
  const [professionals, setProfessionals] = useState<Professional[]>(loadProfessionals);
  const [formData, setFormData] = useState<ProfessionalFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<ProfessionalFormErrors>({});
  const [editingProfessionalId, setEditingProfessionalId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState("");
  const [scheduleProfessionalId, setScheduleProfessionalId] = useState<number | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(professionals));
  }, [professionals]);

  const activeProfessionals = professionals.filter((professional) => professional.status === "ativo").length;
  const uniqueSpecialties = new Set(professionals.flatMap((professional) => professional.specialties)).size;

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingProfessionalId(null);
    resetForm();
  };

  const openCreateForm = () => {
    setEditingProfessionalId(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditForm = (professional: Professional) => {
    setEditingProfessionalId(professional.id);
      setFormData({
        name: professional.name,
        phone: professional.phone,
        specialties: professional.specialties.join(", "),
        schedule: professional.schedule,
        notes: professional.notes,
      });
    setFormErrors({});
    setDialogOpen(true);
  };

  const clearForm = () => {
    setEditingProfessionalId(null);
    resetForm();
  };

  const closeScheduleDialog = () => {
    setScheduleDialogOpen(false);
    setScheduleProfessionalId(null);
    setScheduleDraft("");
  };

  const openScheduleForm = (professional: Professional) => {
    setScheduleProfessionalId(professional.id);
    setScheduleDraft(professional.schedule);
    setScheduleDialogOpen(true);
  };

  const handleChange = (field: keyof ProfessionalFormData, value: string) => {
    const nextValue = field === "phone" ? normalizePhone(value) : value;

    setFormData((currentData) => ({
      ...currentData,
      [field]: nextValue,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: validateField(field, nextValue),
    }));
  };

  const handleCreateOrUpdateProfessional = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateFormData(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Revise os campos invalidos antes de salvar.");
      return;
    }

    const trimmedName = formData.name.trim();
    const parsedSpecialties = parseSpecialties(formData.specialties);

    if (editingProfessionalId !== null) {
      setProfessionals((currentProfessionals) =>
        currentProfessionals.map((professional) =>
          professional.id === editingProfessionalId
            ? {
                ...professional,
                name: trimmedName,
                avatar: buildAvatar(trimmedName),
                phone: formData.phone.trim(),
                specialties: parsedSpecialties,
                schedule: formData.schedule.trim(),
                notes: formData.notes.trim(),
              }
            : professional,
        ),
      );

      closeDialog();
      toast.success("Profissional atualizado com sucesso!");
      return;
    }

    const newProfessional: Professional = {
      id: Date.now(),
      name: trimmedName,
      avatar: buildAvatar(trimmedName),
      phone: formData.phone.trim(),
      specialties: parsedSpecialties,
      schedule: formData.schedule.trim(),
      status: "ativo",
      notes: formData.notes.trim(),
    };

    setProfessionals((currentProfessionals) => [newProfessional, ...currentProfessionals]);
    closeDialog();
    toast.success("Profissional cadastrado com sucesso!");
  };

  const handleDeleteProfessional = (professionalId: number) => {
    setProfessionals((currentProfessionals) =>
      currentProfessionals.filter((professional) => professional.id !== professionalId),
    );

    if (editingProfessionalId === professionalId) {
      closeDialog();
    }

    toast.success("Profissional removido com sucesso!");
  };

  const handleSaveSchedule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (scheduleProfessionalId === null) {
      closeScheduleDialog();
      return;
    }

    setProfessionals((currentProfessionals) =>
      currentProfessionals.map((professional) =>
        professional.id === scheduleProfessionalId
          ? {
              ...professional,
              schedule: scheduleDraft.trim(),
            }
          : professional,
      ),
    );

    closeScheduleDialog();
    toast.success("Horarios atualizados com sucesso!");
  };

  const previewSpecialties = parseSpecialties(formData.specialties);

  return (
    <>
      <PageShell
        eyebrow="Gestao"
        title="Equipe e disponibilidade"
        description="Organize os profissionais da casa com uma apresentacao mais clara das especialidades, disponibilidade e atalhos operacionais."
        actions={
          <Button type="button" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            Novo profissional
          </Button>
        }
      >
        <div className="metric-grid">
          <MetricCard
            label="Profissionais"
            value={String(professionals.length)}
            helper="Pessoas cadastradas na equipe"
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            label="Em atividade"
            value={String(activeProfessionals)}
            helper="Disponiveis para agendamento"
            icon={<ShieldCheck className="h-5 w-5" />}
            accent="sand"
          />
          <MetricCard
            label="Especialidades"
            value={String(uniqueSpecialties)}
            helper="Servicos cobertos pela equipe atual"
            icon={<Clock3 className="h-5 w-5" />}
            accent="coral"
          />
        </div>

        <SectionCard
          title="Equipe cadastrada"
          description="Cada card concentra as informacoes essenciais para editar cadastro, revisar agenda e aplicar bloqueios rapidamente."
        >
          {professionals.length === 0 ? (
            <EmptyStatePanel
              icon={<Users className="h-7 w-7" />}
              title="Nenhum profissional cadastrado"
              description="Adicione o primeiro profissional para organizar especialidades, contato e operacao da agenda em um unico lugar."
              action={
                <Button type="button" onClick={openCreateForm}>
                  <Plus className="h-4 w-4" />
                  Adicionar profissional
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4">
              {professionals.map((professional) => (
                <article
                  key={professional.id}
                  className="grid gap-5 rounded-[1.6rem] border border-white/70 bg-white/64 p-5 shadow-[0_22px_52px_-34px_rgba(73,47,22,0.34)] lg:grid-cols-[minmax(0,1fr)_15rem]"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="flex h-18 w-18 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(31,109,104,0.95),rgba(53,92,125,0.88))] text-3xl text-white shadow-[0_24px_48px_-26px_rgba(31,109,104,0.8)]">
                      {professional.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <h3 className="text-2xl text-foreground">{professional.name}</h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {professional.specialties.map((specialty) => (
                              <span key={specialty} className="soft-badge" data-variant="warm">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="soft-badge">
                          <span className="status-dot" />
                          {professional.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      {professional.notes ? (
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">{professional.notes}</p>
                      ) : null}

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <div className="data-pill justify-between">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            Contato
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {professional.phone ? formatPhone(professional.phone) : "Nao informado"}
                          </span>
                        </div>
                        <div className="data-pill justify-between">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Clock3 className="h-4 w-4" />
                            Agenda
                          </span>
                          <span className="text-right text-sm font-medium text-foreground">
                            {professional.schedule || (professional.status === "ativo" ? "Disponivel" : "Pausado")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <Button type="button" variant="outline" className="justify-start" onClick={() => openEditForm(professional)}>
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start"
                      onClick={() => openScheduleForm(professional)}
                    >
                      <Clock3 className="h-4 w-4" />
                      Horarios
                    </Button>
                    <Button type="button" variant="outline" className="justify-start">
                      <Ban className="h-4 w-4" />
                      Bloqueios
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start text-destructive hover:text-destructive"
                      onClick={() => handleDeleteProfessional(professional.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </PageShell>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="rounded-[1.75rem] border-white/70 bg-[linear-gradient(180deg,rgba(255,251,246,0.97),rgba(248,241,231,0.94))] p-6 shadow-[0_30px_80px_-38px_rgba(73,47,22,0.34)] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-foreground">
              {editingProfessionalId === null ? "Novo profissional" : "Editar profissional"}
            </DialogTitle>
            <DialogDescription className="leading-6">
              {editingProfessionalId === null
                ? "Cadastre os dados do profissional em uma janela rapida, com preview antes de salvar."
                : "Atualize o cadastro do profissional localmente enquanto a tela ainda opera sem back-end."}
            </DialogDescription>
          </DialogHeader>

          <form noValidate onSubmit={handleCreateOrUpdateProfessional} className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="professional-name">Nome</label>
                <Input
                  id="professional-name"
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  aria-invalid={Boolean(formErrors.name)}
                  placeholder="Ex.: Carlos Souza"
                />
                {formErrors.name ? <p className="text-sm text-destructive">{formErrors.name}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="professional-phone">Telefone</label>
                  <Input
                    id="professional-phone"
                    type="text"
                    value={formatPhone(formData.phone)}
                    onChange={(event) => handleChange("phone", event.target.value)}
                    aria-invalid={Boolean(formErrors.phone)}
                    placeholder="11999999999"
                    inputMode="numeric"
                  />
                  {formErrors.phone ? (
                    <p className="text-sm text-destructive">{formErrors.phone}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Use 10 ou 11 numeros com DDD.</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="professional-specialties">Especialidades</label>
                  <Input
                    id="professional-specialties"
                    value={formData.specialties}
                    onChange={(event) => handleChange("specialties", event.target.value)}
                    aria-invalid={Boolean(formErrors.specialties)}
                    placeholder="Corte, Barba, Sobrancelha"
                  />
                  {formErrors.specialties ? (
                    <p className="text-sm text-destructive">{formErrors.specialties}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Separe as especialidades por virgula.</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="professional-schedule">Horarios</label>
                <Textarea
                  id="professional-schedule"
                  value={formData.schedule}
                  onChange={(event) => handleChange("schedule", event.target.value)}
                  placeholder="Ex.: Seg a Sex, 09:00 as 18:00 | Sab, 08:00 as 14:00"
                  rows={3}
                  className="rounded-[1rem] border-white/70 bg-input-background px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_44px_-28px_rgba(70,47,28,0.32)]"
                />
                <p className="text-sm text-muted-foreground">
                  Informe os dias e periodos de atendimento que devem aparecer no cadastro.
                </p>
              </div>

              <div className="grid gap-2">
                <label htmlFor="professional-notes">Observacoes</label>
                <Textarea
                  id="professional-notes"
                  value={formData.notes}
                  onChange={(event) => handleChange("notes", event.target.value)}
                  placeholder="Ex.: atende melhor no periodo da tarde e faz acabamento premium."
                  rows={5}
                  className="rounded-[1rem] border-white/70 bg-input-background px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_44px_-28px_rgba(70,47,28,0.32)]"
                />
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/70 bg-white/58 p-5 shadow-[0_22px_52px_-34px_rgba(73,47,22,0.34)]">
              <span className="soft-badge" data-variant="warm">
                Preview do cadastro
              </span>

              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(31,109,104,0.95),rgba(53,92,125,0.88))] text-2xl text-white shadow-[0_24px_48px_-26px_rgba(31,109,104,0.8)]">
                  {buildAvatar(formData.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl text-foreground">{formData.name.trim() || "Novo profissional"}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {formData.notes.trim() || "Adicione observacoes para descrever a forma de atendimento ou horarios preferenciais."}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(previewSpecialties.length > 0 ? previewSpecialties : ["Especialidades ainda nao informadas"]).map((specialty) => (
                  <span key={specialty} className="soft-badge" data-variant="warm">
                    {specialty}
                  </span>
                ))}
              </div>

              <div className="mt-5 grid gap-3">
                <div className="data-pill justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Contato
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formData.phone ? formatPhone(formData.phone) : "Nao informado"}
                  </span>
                </div>
                <div className="data-pill justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    Horarios
                  </span>
                  <span className="text-right text-sm font-medium text-foreground">
                    {formData.schedule.trim() || "Nao informado"}
                  </span>
                </div>
                <div className="data-pill justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    Status inicial
                  </span>
                  <span className="text-sm font-medium text-foreground">Ativo</span>
                </div>
              </div>
            </div>

            <DialogFooter className="xl:col-span-2 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="button" variant="outline" onClick={clearForm}>
                Limpar formulario
              </Button>
              <Button type="submit">
                <Plus className="h-4 w-4" />
                {editingProfessionalId === null ? "Salvar profissional" : "Salvar alteracoes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleDialogOpen} onOpenChange={(open) => (open ? setScheduleDialogOpen(true) : closeScheduleDialog())}>
        <DialogContent className="rounded-[1.75rem] border-white/70 bg-[linear-gradient(180deg,rgba(255,251,246,0.97),rgba(248,241,231,0.94))] p-6 shadow-[0_30px_80px_-38px_rgba(73,47,22,0.34)] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-foreground">Horarios do profissional</DialogTitle>
            <DialogDescription className="leading-6">
              Defina como a disponibilidade deve aparecer no card do profissional.
            </DialogDescription>
          </DialogHeader>

          <form noValidate onSubmit={handleSaveSchedule} className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="professional-schedule-dialog">Horarios</label>
              <Textarea
                id="professional-schedule-dialog"
                value={scheduleDraft}
                onChange={(event) => setScheduleDraft(event.target.value)}
                placeholder="Ex.: Seg a Sex, 09:00 as 18:00 | Sab, 08:00 as 14:00"
                rows={4}
                className="rounded-[1rem] border-white/70 bg-input-background px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_18px_44px_-28px_rgba(70,47,28,0.32)]"
              />
              <p className="text-sm text-muted-foreground">
                Voce pode descrever turnos, pausas ou dias especificos em texto livre.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeScheduleDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                <Clock3 className="h-4 w-4" />
                Salvar horarios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster position="bottom-left" closeButton richColors />
    </>
  );
}
