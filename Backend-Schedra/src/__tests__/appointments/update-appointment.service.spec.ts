import type { AppointmentDto } from "../../modules/appointments/dtos/appointment.dto";
import { AppointmentConflictError } from "../../modules/appointments/errors/appointment-conflict.error";
import type { AppointmentRepository } from "../../modules/appointments/repositories/appointment.repository";
import type { SchedulingPolicyService } from "../../modules/appointments/services/scheduling-policy.service";
import { UpdateAppointmentService } from "../../modules/appointments/services/update-appointment.service";
import type { ClientRepository } from "../../modules/clients/repositories/client.repository";
import type { ProfessionalRepository } from "../../modules/professionals/repositories/professional.repository";
import type { ServiceRepository } from "../../modules/services/repositories/service.repository";

const appointment: AppointmentDto = {
  id: 9,
  clientId: 1,
  clientName: "Ana",
  professionalId: 2,
  professionalName: "Bia",
  serviceId: 3,
  serviceName: "Corte",
  scheduledAt: "2026-09-02T12:00:00.000Z",
  endsAt: "2026-09-02T12:45:00.000Z",
  durationMinutes: 45,
  priceSnapshot: 80,
  version: 4,
  status: "pendente",
  notes: "",
};

const clientRepository = {
  findById: jest.fn().mockResolvedValue({ id: 1, name: "Ana" }),
} as unknown as ClientRepository;
const professionalRepository = {
  findById: jest.fn().mockResolvedValue({ id: 2, name: "Bia" }),
} as unknown as ProfessionalRepository;
const serviceRepository = {
  findById: jest.fn().mockResolvedValue({
    id: 3,
    name: "Corte premium",
    category: "Cabelo",
    durationMinutes: 60,
    price: 95,
    description: "",
  }),
} as unknown as ServiceRepository;
const schedulingPolicy = {
  validate: jest.fn().mockResolvedValue({ valid: true }),
} as unknown as SchedulingPolicyService;

const input = {
  clientId: 1,
  professionalId: 2,
  serviceId: 3,
  scheduledAt: "2026-09-02T13:00:00.000Z",
  status: "confirmado" as const,
  notes: "",
  version: 4,
};

const buildService = (update: jest.Mock) => {
  const repository = {
    findById: jest.fn().mockResolvedValue(appointment),
    update,
  } as unknown as AppointmentRepository;
  return { service: new UpdateAppointmentService(repository, clientRepository, professionalRepository, serviceRepository, schedulingPolicy), repository };
};

describe("UpdateAppointmentService", () => {
  it("exige a versão para impedir sobrescrita silenciosa", async () => {
    const { service, repository } = buildService(jest.fn());
    const result = await service.execute(1, 9, { ...input, version: undefined } as never);
    expect(result).toEqual({
      success: false,
      message: "A versão atual do agendamento é obrigatória. Atualize a tela e tente novamente.",
      statusCode: 409,
    });
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it("traduz uma colisão transacional em 409", async () => {
    const { service } = buildService(jest.fn().mockRejectedValue(new AppointmentConflictError()));
    const result = await service.execute(1, 9, input);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.statusCode).toBe(409);
  });

  it("preserva snapshot, duração e versão na atualização", async () => {
    const update = jest.fn().mockResolvedValue({ ...appointment, version: 5, serviceName: "Corte premium" });
    const { service } = buildService(update);
    const result = await service.execute(1, 9, input);
    expect(result.success).toBe(true);
    expect(update).toHaveBeenCalledWith(1, 9, expect.objectContaining({
      durationMinutes: 60,
      serviceNameSnapshot: "Corte premium",
      priceSnapshot: 95,
      version: 4,
    }));
  });
});
