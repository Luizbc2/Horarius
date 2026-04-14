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
import {
  asBoolean,
  asNullableString,
  asNumber,
  asRequestBody,
  asString,
  type RequestBody,
  type RequestValue,
} from "../../../shared/http/request-parser";

const professionalRepository = new SequelizeProfessionalRepository();

export class ProfessionalsController {
  public async getById(request: Request, response: Response): Promise<Response> {
    const getProfessionalService = new GetProfessionalService(professionalRepository);
    const id = Number(request.params.id);
    const result = await getProfessionalService.execute(id);

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(200).json(result.data);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const listProfessionalsService = new ListProfessionalsService(professionalRepository);
    const query: ListProfessionalsQueryDto = {
      page: asNumber(request.query.page),
      limit: asNumber(request.query.limit),
      search: asString(request.query.search),
    };

    const result = await listProfessionalsService.execute(query);

    return response.status(200).json(result.data);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const createProfessionalService = new CreateProfessionalService(professionalRepository);
    const result = await createProfessionalService.execute(this.buildProfessionalPayload(request));

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(201).json(result.data);
  }

  public async listWorkDays(request: Request, response: Response): Promise<Response> {
    const listProfessionalWorkDaysService = new ListProfessionalWorkDaysService(professionalRepository);
    const professionalId = Number(request.params.id);
    const result = await listProfessionalWorkDaysService.execute(professionalId);

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(200).json(result.data);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const updateProfessionalService = new UpdateProfessionalService(professionalRepository);
    const id = Number(request.params.id);
    const result = await updateProfessionalService.execute(id, this.buildProfessionalPayload(request));

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(200).json(result.data);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const deleteProfessionalService = new DeleteProfessionalService(professionalRepository);
    const id = Number(request.params.id);
    const result = await deleteProfessionalService.execute(id);

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(200).json(result.data);
  }

  public async updateWorkDays(request: Request, response: Response): Promise<Response> {
    const updateProfessionalWorkDaysService = new UpdateProfessionalWorkDaysService(professionalRepository);
    const id = Number(request.params.id);
    const result = await updateProfessionalWorkDaysService.execute(id, this.buildWorkDaysPayload(request));

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(200).json(result.data);
  }

  private buildProfessionalPayload(request: Request) {
    const body = asRequestBody(request.body);

    return {
      name: asString(body.name),
      email: asString(body.email),
      phone: asString(body.phone),
      specialty: asString(body.specialty),
      status: asString(body.status),
    };
  }

  private buildWorkDaysPayload(request: Request): UpdateProfessionalWorkDaysRequestDto {
    const body = asRequestBody(request.body);

    return {
      workDays: this.parseWorkDays(body.workDays),
    };
  }

  private sendFailure(response: Response, statusCode: number, message: string): Response {
    return response.status(statusCode).json({ message });
  }

  private parseWorkDays(value: RequestValue): UpdateProfessionalWorkDaysRequestDto["workDays"] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => this.parseWorkDay(item));
  }

  private parseWorkDay(value: RequestValue): ProfessionalWorkDayInputDto {
    const item = this.parseWorkDayItem(value);

    return {
      dayOfWeek: asString(item.dayOfWeek),
      enabled: asBoolean(item.enabled),
      startTime: asString(item.startTime),
      endTime: asString(item.endTime),
      breakStart: asNullableString(item.breakStart),
      breakEnd: asNullableString(item.breakEnd),
    };
  }

  private parseWorkDayItem(value: RequestValue): RequestBody {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return value as RequestBody;
  }
}
