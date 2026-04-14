import { Request, Response } from "express";

import { ListClientsQueryDto } from "../dtos/client.dto";
import { SequelizeClientRepository } from "../repositories/sequelize-client.repository";
import { CreateClientService } from "../services/create-client.service";
import { DeleteClientService } from "../services/delete-client.service";
import { GetClientService } from "../services/get-client.service";
import { ListClientsService } from "../services/list-clients.service";
import { UpdateClientService } from "../services/update-client.service";
import { asNumber, asRequestBody, asString } from "../../../shared/http/request-parser";

const clientRepository = new SequelizeClientRepository();

export class ClientsController {
  public async getById(request: Request, response: Response): Promise<Response> {
    const getClientService = new GetClientService(clientRepository);
    const id = Number(request.params.id);
    const result = await getClientService.execute(id);

    if (!result.success) {
      return response.status(result.statusCode).json({
        message: result.message,
      });
    }

    return response.status(200).json(result.data);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const listClientsService = new ListClientsService(clientRepository);
    const query: ListClientsQueryDto = {
      page: asNumber(request.query.page),
      limit: asNumber(request.query.limit),
      search: asString(request.query.search),
    };

    const result = await listClientsService.execute(query);

    return response.status(200).json(result.data);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const createClientService = new CreateClientService(clientRepository);
    const body = asRequestBody(request.body);
    const result = await createClientService.execute({
      name: asString(body.name),
      email: asString(body.email),
      phone: asString(body.phone),
      cpf: asString(body.cpf),
      notes: asString(body.notes),
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
    const body = asRequestBody(request.body);
    const id = Number(request.params.id);
    const result = await updateClientService.execute(id, {
      name: asString(body.name),
      email: asString(body.email),
      phone: asString(body.phone),
      cpf: asString(body.cpf),
      notes: asString(body.notes),
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
}
