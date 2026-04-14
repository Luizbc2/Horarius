import { Request, Response } from "express";

import { ListServicesQueryDto } from "../dtos/service.dto";
import { SequelizeServiceRepository } from "../repositories/sequelize-service.repository";
import { CreateServiceService } from "../services/create-service.service";
import { DeleteServiceService } from "../services/delete-service.service";
import { GetServiceService } from "../services/get-service.service";
import { ListServicesService } from "../services/list-services.service";
import { UpdateServiceService } from "../services/update-service.service";
import {
  asNumber,
  asRequestBody,
  asRequiredNumber,
  asString,
} from "../../../shared/http/request-parser";

const serviceRepository = new SequelizeServiceRepository();

export class ServicesController {
  public async getById(request: Request, response: Response): Promise<Response> {
    const getServiceService = new GetServiceService(serviceRepository);
    const id = Number(request.params.id);
    const result = await getServiceService.execute(id);

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(200).json(result.data);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const listServicesService = new ListServicesService(serviceRepository);
    const query: ListServicesQueryDto = {
      page: asNumber(request.query.page),
      limit: asNumber(request.query.limit),
      search: asString(request.query.search),
    };

    const result = await listServicesService.execute(query);

    return response.status(200).json(result.data);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const createServiceService = new CreateServiceService(serviceRepository);
    const result = await createServiceService.execute(this.buildServicePayload(request));

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(201).json(result.data);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const updateServiceService = new UpdateServiceService(serviceRepository);
    const id = Number(request.params.id);
    const result = await updateServiceService.execute(id, this.buildServicePayload(request));

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(200).json(result.data);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const deleteServiceService = new DeleteServiceService(serviceRepository);
    const id = Number(request.params.id);
    const result = await deleteServiceService.execute(id);

    if (!result.success) {
      return this.sendFailure(response, result.statusCode, result.message);
    }

    return response.status(200).json(result.data);
  }

  private buildServicePayload(request: Request) {
    const body = asRequestBody(request.body);

    return {
      name: asString(body.name),
      category: asString(body.category),
      durationMinutes: asRequiredNumber(body.durationMinutes),
      price: asRequiredNumber(body.price),
      description: asString(body.description),
    };
  }

  private sendFailure(response: Response, statusCode: number, message: string): Response {
    return response.status(statusCode).json({ message });
  }
}
