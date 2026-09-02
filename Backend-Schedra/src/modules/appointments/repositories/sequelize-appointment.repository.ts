import {
  Op,
  Transaction,
  UniqueConstraintError,
  type Model,
  type ModelStatic,
  type WhereOptions,
} from "sequelize";

import { database } from "../../../config/database";
import {
  buildTenantOwnership,
  buildTenantWhere,
  getActiveMembershipId,
  getActiveOrganizationId,
  getActiveOrganizationRole,
} from "../../../shared/data/tenant-scope";
import { ClientModel } from "../../clients/models/client.model";
import { ProfessionalModel } from "../../professionals/models/professional.model";
import { ServiceModel } from "../../services/models/service.model";
import type {
  AppointmentDto,
  AppointmentStatus,
  PersistAppointmentRequestDto,
  SwapAppointmentsRequestDto,
} from "../dtos/appointment.dto";
import { AppointmentConflictError } from "../errors/appointment-conflict.error";
import { AppointmentAccessError } from "../errors/appointment-access.error";
import { AppointmentModel } from "../models/appointment.model";
import type { AppointmentRepository, ListAppointmentsRepositoryResult } from "./appointment.repository";
import { resolveActiveOrganizationTimeZone } from "../../../platform/tenancy/organization-timezone.service";
import { getZonedDayRange } from "../../../shared/utils/time-zone.util";

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

type DynamicRecord = Model<Record<string, unknown>, Record<string, unknown>>;
const SLOT_SIZE_MS = 5 * 60_000;
const SCHEDULING_CONFLICT_CODES = new Set(["40001", "40P01", "ER_DUP_ENTRY", "ER_LOCK_DEADLOCK", "1213"]);

const isSchedulingConflict = (error: unknown): boolean => {
  if (error instanceof UniqueConstraintError) return true;
  const databaseError = error as { original?: { code?: string; sqlState?: string } };
  const code = databaseError.original?.code ?? databaseError.original?.sqlState;
  return Boolean(code && SCHEDULING_CONFLICT_CODES.has(code));
};

export class SequelizeAppointmentRepository implements AppointmentRepository {
  public async findById(userId: number, id: number): Promise<AppointmentDto | null> {
    const appointment = await AppointmentModel.findOne({
      where: await this.buildScopedWhere(userId, { id }),
      include: this.getInclude(),
    });
    return appointment ? this.toAppointmentDto(appointment as AppointmentWithRelations) : null;
  }

  public async list(userId: number, query: ListAppointmentsInput): Promise<ListAppointmentsRepositoryResult> {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, query.limit);
    const { rows, count } = await AppointmentModel.findAndCountAll({
      where: await this.buildWhereClause(userId, query),
      include: this.getInclude(),
      distinct: true,
      limit,
      offset: (page - 1) * limit,
      order: [["scheduledAt", "ASC"]],
    });
    return {
      appointments: rows.map((appointment) => this.toAppointmentDto(appointment as AppointmentWithRelations)),
      totalItems: count,
    };
  }

  public async create(userId: number, input: PersistAppointmentRequestDto): Promise<AppointmentDto> {
    await this.assertProfessionalAccess(input.professionalId);
    let createdId = 0;

    try {
      await database.getConnection().transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE }, async (transaction) => {
        const appointment = await AppointmentModel.create({
          ...buildTenantOwnership(userId),
          clientId: input.clientId,
          professionalId: input.professionalId,
          serviceId: input.serviceId,
          scheduledAt: new Date(input.scheduledAt),
          endsAt: new Date(input.endsAt),
          durationMinutes: input.durationMinutes,
          clientNameSnapshot: input.clientNameSnapshot,
          professionalNameSnapshot: input.professionalNameSnapshot,
          serviceNameSnapshot: input.serviceNameSnapshot,
          priceSnapshot: input.priceSnapshot,
          status: input.status,
          notes: input.notes,
        }, { transaction });
        createdId = appointment.id;
        await this.reserveSlots(appointment, transaction);
        await this.recordStatus(appointment.id, userId, null, input.status, transaction);
      });
    } catch (error) {
      if (isSchedulingConflict(error)) throw new AppointmentConflictError();
      throw error;
    }

    const created = await this.findById(userId, createdId);
    if (!created) throw new Error("Falha ao carregar o agendamento criado.");
    return created;
  }

  public async update(userId: number, id: number, input: PersistAppointmentRequestDto): Promise<AppointmentDto | null> {
    await this.assertProfessionalAccess(input.professionalId);
    let found = true;

    try {
      await database.getConnection().transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE }, async (transaction) => {
        const appointment = await AppointmentModel.findOne({
          where: await this.buildScopedWhere(userId, { id }),
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!appointment) {
          found = false;
          return;
        }
        if (input.version !== undefined && appointment.version !== input.version) {
          throw new AppointmentConflictError("O agendamento foi alterado por outra pessoa. Atualize a tela e tente novamente.");
        }

        const previousStatus = appointment.status;
        await this.releaseSlots(appointment.id, transaction);
        appointment.clientId = input.clientId;
        appointment.professionalId = input.professionalId;
        appointment.serviceId = input.serviceId;
        appointment.scheduledAt = new Date(input.scheduledAt);
        appointment.endsAt = new Date(input.endsAt);
        appointment.durationMinutes = input.durationMinutes;
        appointment.clientNameSnapshot = input.clientNameSnapshot;
        appointment.professionalNameSnapshot = input.professionalNameSnapshot;
        appointment.serviceNameSnapshot = input.serviceNameSnapshot;
        appointment.priceSnapshot = input.priceSnapshot;
        appointment.status = input.status;
        appointment.notes = input.notes;
        await appointment.save({ transaction });
        await this.reserveSlots(appointment, transaction);
        if (previousStatus !== input.status) {
          await this.recordStatus(appointment.id, userId, previousStatus, input.status, transaction);
        }
      });
    } catch (error) {
      if (isSchedulingConflict(error)) throw new AppointmentConflictError();
      throw error;
    }

    return found ? this.findById(userId, id) : null;
  }

  public async swap(userId: number, input: SwapAppointmentsRequestDto): Promise<AppointmentDto[] | null> {
    let found = true;

    try {
      await database.getConnection().transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE }, async (transaction) => {
        const appointments = await AppointmentModel.findAll({
          where: {
            id: { [Op.in]: [input.firstId, input.secondId] },
            ...(await this.buildScopedWhere(userId)),
          },
          order: [["id", "ASC"]],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (appointments.length !== 2) {
          found = false;
          return;
        }

        const first = appointments.find((appointment) => appointment.id === input.firstId);
        const second = appointments.find((appointment) => appointment.id === input.secondId);
        if (!first || !second) {
          found = false;
          return;
        }
        if (first.version !== input.firstVersion || second.version !== input.secondVersion) {
          throw new AppointmentConflictError("Um dos agendamentos foi alterado por outra pessoa. Atualize a tela e tente novamente.");
        }

        const firstDestination = {
          professionalId: second.professionalId,
          scheduledAt: new Date(second.scheduledAt),
        };
        const secondDestination = {
          professionalId: first.professionalId,
          scheduledAt: new Date(first.scheduledAt),
        };

        await this.releaseSlots(first.id, transaction);
        await this.releaseSlots(second.id, transaction);

        first.professionalId = firstDestination.professionalId;
        first.scheduledAt = firstDestination.scheduledAt;
        first.endsAt = new Date(first.scheduledAt.getTime() + (first.durationMinutes ?? 30) * 60_000);
        second.professionalId = secondDestination.professionalId;
        second.scheduledAt = secondDestination.scheduledAt;
        second.endsAt = new Date(second.scheduledAt.getTime() + (second.durationMinutes ?? 30) * 60_000);

        await first.save({ transaction });
        await second.save({ transaction });
        await this.reserveSlots(first, transaction);
        await this.reserveSlots(second, transaction);
      });
    } catch (error) {
      if (isSchedulingConflict(error)) throw new AppointmentConflictError();
      throw error;
    }

    if (!found) return null;
    const [first, second] = await Promise.all([
      this.findById(userId, input.firstId),
      this.findById(userId, input.secondId),
    ]);
    return first && second ? [first, second] : null;
  }

  public async delete(userId: number, id: number): Promise<boolean> {
    return database.getConnection().transaction(async (transaction) => {
      const appointment = await AppointmentModel.findOne({
        where: await this.buildScopedWhere(userId, { id }),
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!appointment) return false;
      await this.releaseSlots(id, transaction);
      await appointment.destroy({ transaction });
      return true;
    });
  }

  private async reserveSlots(appointment: AppointmentModel, transaction: Transaction): Promise<void> {
    if (appointment.status === "cancelado") return;
    const organizationId = appointment.organizationId ?? getActiveOrganizationId();
    if (!organizationId || !appointment.endsAt) return;
    const Slot = database.getConnection().models.AppointmentSlot as ModelStatic<DynamicRecord>;
    const slots: Array<Record<string, unknown>> = [];
    let cursor = Math.floor(appointment.scheduledAt.getTime() / SLOT_SIZE_MS) * SLOT_SIZE_MS;
    while (cursor < appointment.endsAt.getTime()) {
      slots.push({
        organizationId,
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        slotStart: new Date(cursor),
      });
      cursor += SLOT_SIZE_MS;
    }
    if (slots.length) await Slot.bulkCreate(slots, { transaction });
  }

  private async releaseSlots(appointmentId: number, transaction: Transaction): Promise<void> {
    const Slot = database.getConnection().models.AppointmentSlot as ModelStatic<DynamicRecord>;
    await Slot.destroy({ where: { appointmentId }, transaction });
  }

  private async recordStatus(
    appointmentId: number,
    userId: number,
    fromStatus: string | null,
    toStatus: string,
    transaction: Transaction,
  ): Promise<void> {
    const History = database.getConnection().models.AppointmentStatusHistory as ModelStatic<DynamicRecord>;
    await History.create({ appointmentId, changedByUserId: userId, fromStatus, toStatus, reason: null }, { transaction });
  }

  private async buildWhereClause(userId: number, query: ListAppointmentsInput): Promise<WhereOptions<AppointmentModel>> {
    const whereClause = { ...(await this.buildScopedWhere(userId) as object) } as Record<string, unknown>;
    if (query.professionalId) {
      const scopedProfessionalId = whereClause.professionalId as number | undefined;
      whereClause.professionalId = scopedProfessionalId !== undefined && scopedProfessionalId !== query.professionalId
        ? -1
        : query.professionalId;
    }
    if (query.status) whereClause.status = query.status;
    if (query.date) {
      const range = getZonedDayRange(query.date, await resolveActiveOrganizationTimeZone());
      if (range) whereClause.scheduledAt = { [Op.gte]: range.startsAt, [Op.lt]: range.endsAt };
    }
    return whereClause as WhereOptions<AppointmentModel>;
  }

  private async buildScopedWhere(
    userId: number,
    extra: WhereOptions<AppointmentModel> = {},
  ): Promise<WhereOptions<AppointmentModel>> {
    const professionalId = await this.resolveProfessionalScope();
    return {
      ...extra,
      ...buildTenantWhere(userId),
      ...(professionalId === undefined ? {} : { professionalId }),
    };
  }

  private async assertProfessionalAccess(professionalId: number): Promise<void> {
    const scopedProfessionalId = await this.resolveProfessionalScope();
    if (scopedProfessionalId !== undefined && scopedProfessionalId !== professionalId) {
      throw new AppointmentAccessError();
    }
  }

  private async resolveProfessionalScope(): Promise<number | undefined> {
    if (getActiveOrganizationRole() !== "staff") return undefined;
    const membershipId = getActiveMembershipId();
    if (!membershipId) return -1;
    const professional = await ProfessionalModel.findOne({
      where: { ...buildTenantWhere(0), membershipId },
      attributes: ["id"],
    });
    return professional?.id ?? -1;
  }

  private getInclude() {
    return [
      { model: ClientModel, as: "client" },
      { model: ProfessionalModel, as: "professional" },
      { model: ServiceModel, as: "service" },
    ];
  }

  private toAppointmentDto(appointment: AppointmentWithRelations): AppointmentDto {
    const durationMinutes = appointment.durationMinutes ?? appointment.service?.durationMinutes ?? 30;
    const endsAt = appointment.endsAt ?? new Date(appointment.scheduledAt.getTime() + durationMinutes * 60_000);
    return {
      id: appointment.id,
      clientId: appointment.clientId,
      clientName: appointment.clientNameSnapshot ?? appointment.client?.name ?? "",
      professionalId: appointment.professionalId,
      professionalName: appointment.professionalNameSnapshot ?? appointment.professional?.name ?? "",
      serviceId: appointment.serviceId,
      serviceName: appointment.serviceNameSnapshot ?? appointment.service?.name ?? "",
      scheduledAt: appointment.scheduledAt.toISOString(),
      endsAt: endsAt.toISOString(),
      durationMinutes,
      priceSnapshot: Number(appointment.priceSnapshot ?? appointment.service?.price ?? 0),
      version: appointment.version,
      status: appointment.status as AppointmentStatus,
      notes: appointment.notes,
    };
  }
}
