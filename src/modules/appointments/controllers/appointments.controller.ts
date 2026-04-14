import { Request, Response } from "express";

import { AppointmentStatus, ListAppointmentsQueryDto } from "../dtos/appointment.dto";
import { SequelizeAppointmentRepository } from "../repositories/sequelize-appointment.repository";
import { CreateAppointmentService } from "../services/create-appointment.service";
import { DeleteAppointmentService } from "../services/delete-appointment.service";
import { ListAppointmentsService } from "../services/list-appointments.service";
import { UpdateAppointmentService } from "../services/update-appointment.service";
import {
  asNumber,
  asRequestBody,
  asString,
  type RequestValue,
} from "../../../shared/http/request-parser";

const appointmentRepository = new SequelizeAppointmentRepository();

export class AppointmentsController {
  public async list(request: Request, response: Response): Promise<Response> {
    const listAppointmentsService = new ListAppointmentsService(appointmentRepository);
    const result = await listAppointmentsService.execute(this.buildListQuery(request));

    return response.status(200).json(result.data);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const createAppointmentService = new CreateAppointmentService(appointmentRepository);
    const result = await createAppointmentService.execute(this.buildAppointmentPayload(request));

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(201).json(result.data);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const updateAppointmentService = new UpdateAppointmentService(appointmentRepository);
    const id = Number(request.params.id);
    const result = await updateAppointmentService.execute(id, this.buildAppointmentPayload(request));

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(200).json(result.data);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const deleteAppointmentService = new DeleteAppointmentService(appointmentRepository);
    const id = Number(request.params.id);
    const result = await deleteAppointmentService.execute(id);

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(200).json(result.data);
  }

  private buildListQuery(request: Request): ListAppointmentsQueryDto {
    return {
      date: asString(request.query.date),
      limit: asNumber(request.query.limit),
      page: asNumber(request.query.page),
      professionalId: asNumber(request.query.professionalId),
      status: this.parseStatus(request.query.status),
    };
  }

  private buildAppointmentPayload(request: Request) {
    const body = asRequestBody(request.body);

    return {
      clientId: asNumber(body.clientId) ?? 0,
      professionalId: asNumber(body.professionalId) ?? 0,
      serviceId: asNumber(body.serviceId) ?? 0,
      scheduledAt: asString(body.scheduledAt),
      status: this.parseBodyStatus(body.status),
      notes: asString(body.notes),
    };
  }

  private sendFailure(response: Response, statusCode: number, message: string): Response {
    return response.status(statusCode).json({ message });
  }

  private parseStatus(value: RequestValue): AppointmentStatus | undefined {
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

  private parseBodyStatus(value: RequestValue): AppointmentStatus {
    return asString(value).trim().toLowerCase() as AppointmentStatus;
  }
}
