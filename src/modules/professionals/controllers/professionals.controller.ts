import { Request, Response } from "express";

import {
  ListProfessionalsQueryDto,
  ProfessionalWorkDayInputDto,
  UpdateProfessionalWorkDaysRequestDto,
} from "../dtos/professional.dto";
import { SequelizeProfessionalRepository } from "../repositories/sequelize-professional.repository";
import { CreateProfessionalService } from "../services/create-professional.service";
import { DeleteProfessionalService } from "../services/delete-professional.service";
import { GetProfessionalService } from "../services/get-professional.service";
import { ListProfessionalWorkDaysService } from "../services/list-professional-work-days.service";
import { ListProfessionalsService } from "../services/list-professionals.service";
import { UpdateProfessionalService } from "../services/update-professional.service";
import { UpdateProfessionalWorkDaysService } from "../services/update-professional-work-days.service";

const professionalRepository = new SequelizeProfessionalRepository();

export class ProfessionalsController {
  public async getById(request: Request, response: Response): Promise<Response> {
    const getProfessionalService = new GetProfessionalService(professionalRepository);
    const id = Number(request.params.id);
    const result = await getProfessionalService.execute(id);

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(200).json(result.data);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const listProfessionalsService = new ListProfessionalsService(professionalRepository);
    const query: ListProfessionalsQueryDto = {
      page: this.parseQueryNumber(request.query.page),
      limit: this.parseQueryNumber(request.query.limit),
      search: this.parseString(request.query.search),
    };

    const result = await listProfessionalsService.execute(query);

    return response.status(200).json(result.data);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const createProfessionalService = new CreateProfessionalService(professionalRepository);
    const body = this.parseBody(request.body);
    const result = await createProfessionalService.execute({
      name: this.parseString(body.name),
      email: this.parseString(body.email),
      phone: this.parseString(body.phone),
      specialty: this.parseString(body.specialty),
      status: this.parseString(body.status),
    });

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(201).json(result.data);
  }

  public async listWorkDays(request: Request, response: Response): Promise<Response> {
    const listProfessionalWorkDaysService = new ListProfessionalWorkDaysService(professionalRepository);
    const professionalId = Number(request.params.id);
    const result = await listProfessionalWorkDaysService.execute(professionalId);

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(200).json(result.data);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const updateProfessionalService = new UpdateProfessionalService(professionalRepository);
    const body = this.parseBody(request.body);
    const id = Number(request.params.id);
    const result = await updateProfessionalService.execute(id, {
      name: this.parseString(body.name),
      email: this.parseString(body.email),
      phone: this.parseString(body.phone),
      specialty: this.parseString(body.specialty),
      status: this.parseString(body.status),
    });

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(200).json(result.data);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const deleteProfessionalService = new DeleteProfessionalService(professionalRepository);
    const id = Number(request.params.id);
    const result = await deleteProfessionalService.execute(id);

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(200).json(result.data);
  }

  public async updateWorkDays(request: Request, response: Response): Promise<Response> {
    const updateProfessionalWorkDaysService = new UpdateProfessionalWorkDaysService(professionalRepository);
    const body = this.parseBody(request.body);
    const id = Number(request.params.id);
    const result = await updateProfessionalWorkDaysService.execute(id, {
      workDays: this.parseWorkDays(body.workDays),
    });

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

  private parseQueryNumber(value: unknown): number | undefined {
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    const parsedValue = Number(value);

    return Number.isNaN(parsedValue) ? undefined : parsedValue;
  }

  private parseWorkDays(value: unknown): UpdateProfessionalWorkDaysRequestDto["workDays"] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => this.parseWorkDay(item));
  }

  private parseWorkDay(value: unknown): ProfessionalWorkDayInputDto {
    const item = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

    return {
      dayOfWeek: this.parseString(item.dayOfWeek),
      enabled: this.parseBoolean(item.enabled),
      startTime: this.parseString(item.startTime),
      endTime: this.parseString(item.endTime),
      breakStart: this.parseNullableString(item.breakStart),
      breakEnd: this.parseNullableString(item.breakEnd),
    };
  }

  private parseBoolean(value: unknown): boolean {
    return value === true;
  }

  private parseNullableString(value: unknown): string | null {
    if (typeof value !== "string") {
      return null;
    }

    const normalizedValue = value.trim();

    return normalizedValue || null;
  }
}
