import { Op, WhereOptions } from "sequelize";

import {
  AppointmentDto,
  AppointmentStatus,
  CreateAppointmentRequestDto,
  UpdateAppointmentRequestDto,
} from "../dtos/appointment.dto";
import { AppointmentModel } from "../models/appointment.model";
import {
  AppointmentRepository,
  ListAppointmentsRepositoryResult,
} from "./appointment.repository";
import { ClientModel } from "../../clients/models/client.model";
import { ProfessionalModel } from "../../professionals/models/professional.model";
import { ServiceModel } from "../../services/models/service.model";

type ListAppointmentsInput = {
  date?: string;
  limit: number;
  page: number;
  professionalId?: number;
  status?: AppointmentStatus;
};

type AppointmentWithRelations = AppointmentModel & {
  client?: ClientModel;
  professional?: ProfessionalModel;
  service?: ServiceModel;
};

export class SequelizeAppointmentRepository implements AppointmentRepository {
  public async findById(userId: number, id: number): Promise<AppointmentDto | null> {
    const appointment = await AppointmentModel.findOne({
      where: {
        id,
        userId,
      },
      include: this.getInclude(),
    });

    if (!appointment) {
      return null;
    }

    return this.toAppointmentDto(appointment as AppointmentWithRelations);
  }

  public async list(userId: number, query: ListAppointmentsInput): Promise<ListAppointmentsRepositoryResult> {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, query.limit);

    const { rows, count } = await AppointmentModel.findAndCountAll({
      where: this.buildWhereClause(userId, query),
      include: this.getInclude(),
      limit,
      offset: (page - 1) * limit,
      order: [["scheduledAt", "ASC"]],
    });

    return {
      appointments: rows.map((appointment) =>
        this.toAppointmentDto(appointment as AppointmentWithRelations),
      ),
      totalItems: count,
    };
  }

  public async create(userId: number, input: CreateAppointmentRequestDto): Promise<AppointmentDto> {
    const appointment = await AppointmentModel.create({
      userId,
      clientId: input.clientId,
      professionalId: input.professionalId,
      serviceId: input.serviceId,
      scheduledAt: new Date(input.scheduledAt),
      status: input.status,
      notes: input.notes,
    });

    const createdAppointment = await this.findById(userId, appointment.id);

    if (!createdAppointment) {
      throw new Error("Falha ao carregar o agendamento criado.");
    }

    return createdAppointment;
  }

  public async update(
    userId: number,
    id: number,
    input: UpdateAppointmentRequestDto,
  ): Promise<AppointmentDto | null> {
    const appointment = await AppointmentModel.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!appointment) {
      return null;
    }

    appointment.clientId = input.clientId;
    appointment.professionalId = input.professionalId;
    appointment.serviceId = input.serviceId;
    appointment.scheduledAt = new Date(input.scheduledAt);
    appointment.status = input.status;
    appointment.notes = input.notes;

    await appointment.save();

    return this.findById(userId, id);
  }

  public async delete(userId: number, id: number): Promise<boolean> {
    const deletedCount = await AppointmentModel.destroy({
      where: {
        id,
        userId,
      },
    });

    return deletedCount > 0;
  }

  private buildWhereClause(
    userId: number,
    query: ListAppointmentsInput,
  ): WhereOptions<AppointmentModel> {
    const whereClause: WhereOptions<AppointmentModel> = {
      userId,
    };

    if (query.professionalId) {
      whereClause.professionalId = query.professionalId;
    }

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.date) {
      const startOfDay = new Date(`${query.date}T00:00:00`);
      const endOfDay = new Date(`${query.date}T23:59:59.999`);

      whereClause.scheduledAt = {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay,
      };
    }

    return whereClause;
  }

  private getInclude() {
    return [
      {
        model: ClientModel,
        as: "client",
      },
      {
        model: ProfessionalModel,
        as: "professional",
      },
      {
        model: ServiceModel,
        as: "service",
      },
    ];
  }

  private toAppointmentDto(appointment: AppointmentWithRelations): AppointmentDto {
    return {
      id: appointment.id,
      clientId: appointment.clientId,
      clientName: appointment.client?.name ?? "",
      professionalId: appointment.professionalId,
      professionalName: appointment.professional?.name ?? "",
      serviceId: appointment.serviceId,
      serviceName: appointment.service?.name ?? "",
      scheduledAt: appointment.scheduledAt.toISOString(),
      status: appointment.status as AppointmentStatus,
      notes: appointment.notes,
    };
  }
}
