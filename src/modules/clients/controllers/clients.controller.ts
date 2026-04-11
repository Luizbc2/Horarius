import { Request, Response } from "express";

import { ListClientsQueryDto } from "../dtos/client.dto";
import { SequelizeClientRepository } from "../repositories/sequelize-client.repository";
import { CreateClientService } from "../services/create-client.service";
import { DeleteClientService } from "../services/delete-client.service";
import { ListClientsService } from "../services/list-clients.service";
import { UpdateClientService } from "../services/update-client.service";

const clientRepository = new SequelizeClientRepository();

export class ClientsController {
  public async list(request: Request, response: Response): Promise<Response> {
    const listClientsService = new ListClientsService(clientRepository);
    const query: ListClientsQueryDto = {
      page: this.parseNumber(request.query.page),
      limit: this.parseNumber(request.query.limit),
      search: this.parseString(request.query.search),
    };

    const result = await listClientsService.execute(query);

    return response.status(200).json(result.data);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const createClientService = new CreateClientService(clientRepository);
    const body = this.parseBody(request.body);
    const result = await createClientService.execute({
      name: this.parseString(body.name),
      email: this.parseString(body.email),
      phone: this.parseString(body.phone),
      cpf: this.parseString(body.cpf),
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
    const updateClientService = new UpdateClientService(clientRepository);
    const body = this.parseBody(request.body);
    const id = Number(request.params.id);
    const result = await updateClientService.execute(id, {
      name: this.parseString(body.name),
      email: this.parseString(body.email),
      phone: this.parseString(body.phone),
      cpf: this.parseString(body.cpf),
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
    const deleteClientService = new DeleteClientService(clientRepository);
    const id = Number(request.params.id);
    const result = await deleteClientService.execute(id);

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
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    const parsedValue = Number(value);

    return Number.isNaN(parsedValue) ? undefined : parsedValue;
  }
}
