import { Request, Response } from "express";

import { AppointmentStatus, ListAppointmentsQueryDto } from "../dtos/appointment.dto";
import { SequelizeAppointmentRepository } from "../repositories/sequelize-appointment.repository";
import { CreateAppointmentService } from "../services/create-appointment.service";
import { DeleteAppointmentService } from "../services/delete-appointment.service";
import { ListAppointmentsService } from "../services/list-appointments.service";
import { UpdateAppointmentService } from "../services/update-appointment.service";

const appointmentRepository = new SequelizeAppointmentRepository();

export class AppointmentsController {
  public async list(request: Request, response: Response): Promise<Response> {
    const listAppointmentsService = new ListAppointmentsService(appointmentRepository);
    const query: ListAppointmentsQueryDto = {
      date: this.parseString(request.query.date),
      limit: this.parseNumber(request.query.limit),
      page: this.parseNumber(request.query.page),
      professionalId: this.parseNumber(request.query.professionalId),
      status: this.parseStatus(request.query.status),
    };

    const result = await listAppointmentsService.execute(query);

    return response.status(200).json(result.data);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const createAppointmentService = new CreateAppointmentService(appointmentRepository);
    const body = this.parseBody(request.body);
    const result = await createAppointmentService.execute({
      clientId: this.parseNumber(body.clientId) ?? 0,
      professionalId: this.parseNumber(body.professionalId) ?? 0,
      serviceId: this.parseNumber(body.serviceId) ?? 0,
      scheduledAt: this.parseString(body.scheduledAt),
      status: this.parseBodyStatus(body.status),
      notes: this.parseString(body.notes),
    });

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(201).json(result.data);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const updateAppointmentService = new UpdateAppointmentService(appointmentRepository);
    const body = this.parseBody(request.body);
    const id = Number(request.params.id);
    const result = await updateAppointmentService.execute(id, {
      clientId: this.parseNumber(body.clientId) ?? 0,
      professionalId: this.parseNumber(body.professionalId) ?? 0,
      serviceId: this.parseNumber(body.serviceId) ?? 0,
      scheduledAt: this.parseString(body.scheduledAt),
      status: this.parseBodyStatus(body.status),
      notes: this.parseString(body.notes),
    });

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(200).json(result.data);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const deleteAppointmentService = new DeleteAppointmentService(appointmentRepository);
    const id = Number(request.params.id);
    const result = await deleteAppointmentService.execute(id);

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(200).json(result.data);
  }

  private parseBody(body: unknown): Record<string, unknown> {
    if (body && typeof body === "object") {
      return body as Record<string, unknown>;
    }

    return {};
  }

  private parseString(value: unknown): string {
    return typeof value === "string" ? value : "";
  }

  private parseNumber(value: unknown): number | undefined {
    if (typeof value === "number") {
      return Number.isNaN(value) ? undefined : value;
    }

    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    const parsedValue = Number(value);

    return Number.isNaN(parsedValue) ? undefined : parsedValue;
  }

  private parseStatus(value: unknown): AppointmentStatus | undefined {
    if (typeof value !== "string") {
      return undefined;
    }

    const normalizedStatus = value.trim().toLowerCase();

    if (
      normalizedStatus === "confirmado" ||
      normalizedStatus === "pendente" ||
      normalizedStatus === "cancelado"
    ) {
      return normalizedStatus;
    }

    return undefined;
  }

  private parseBodyStatus(value: unknown): AppointmentStatus {
    return this.parseString(value).trim().toLowerCase() as AppointmentStatus;
  }
}
