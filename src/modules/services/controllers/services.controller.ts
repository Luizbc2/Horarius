import { Request, Response } from "express";

import { ListServicesQueryDto } from "../dtos/service.dto";
import { SequelizeServiceRepository } from "../repositories/sequelize-service.repository";
import { CreateServiceService } from "../services/create-service.service";
import { DeleteServiceService } from "../services/delete-service.service";
import { GetServiceService } from "../services/get-service.service";
import { ListServicesService } from "../services/list-services.service";
import { UpdateServiceService } from "../services/update-service.service";

const serviceRepository = new SequelizeServiceRepository();

export class ServicesController {
  public async getById(request: Request, response: Response): Promise<Response> {
    const getServiceService = new GetServiceService(serviceRepository);
    const id = Number(request.params.id);
    const result = await getServiceService.execute(id);

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(200).json(result.data);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const listServicesService = new ListServicesService(serviceRepository);
    const query: ListServicesQueryDto = {
      page: this.parseQueryNumber(request.query.page),
      limit: this.parseQueryNumber(request.query.limit),
      search: this.parseString(request.query.search),
    };

    const result = await listServicesService.execute(query);

    return response.status(200).json(result.data);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const createServiceService = new CreateServiceService(serviceRepository);
    const body = this.parseBody(request.body);
    const result = await createServiceService.execute({
      name: this.parseString(body.name),
      category: this.parseString(body.category),
      durationMinutes: this.parseBodyNumber(body.durationMinutes),
      price: this.parseBodyNumber(body.price),
      description: this.parseString(body.description),
    });

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(201).json(result.data);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const updateServiceService = new UpdateServiceService(serviceRepository);
    const body = this.parseBody(request.body);
    const id = Number(request.params.id);
    const result = await updateServiceService.execute(id, {
      name: this.parseString(body.name),
      category: this.parseString(body.category),
      durationMinutes: this.parseBodyNumber(body.durationMinutes),
      price: this.parseBodyNumber(body.price),
      description: this.parseString(body.description),
    });

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(200).json(result.data);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const deleteServiceService = new DeleteServiceService(serviceRepository);
    const id = Number(request.params.id);
    const result = await deleteServiceService.execute(id);

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

  private parseBodyNumber(value: unknown): number {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsedValue = Number(value);
      return Number.isNaN(parsedValue) ? Number.NaN : parsedValue;
    }

    return Number.NaN;
  }
}
