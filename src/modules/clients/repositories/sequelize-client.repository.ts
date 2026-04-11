import { Op } from "sequelize";

import {
  ClientDto,
  CreateClientRequestDto,
  UpdateClientRequestDto
} from "../dtos/client.dto";
import { ClientModel } from "../models/client.model";
import { ClientRepository, ListClientsRepositoryResult } from "./client.repository";

type ListClientsInput = {
  page: number;
  limit: number;
  search: string;
};

export class SequelizeClientRepository implements ClientRepository {
  public async findById(id: number): Promise<ClientDto | null> {
    const client = await ClientModel.findByPk(id);

    if (!client) {
      return null;
    }

    return this.toClientDto(client);
  }

  public async list(query: ListClientsInput): Promise<ListClientsRepositoryResult> {
    const page = Math.max(1, query.page);
    const limit = Math.max(1, query.limit);
    const search = query.search.trim().toLowerCase();

    const { rows, count } = await ClientModel.findAndCountAll({
      where: search
        ? {
            [Op.or]: [
              {
                name: {
                  [Op.iLike]: `%${search}%`
                }
              },
              {
                email: {
                  [Op.iLike]: `%${search}%`
                }
              },
              {
                phone: {
                  [Op.iLike]: `%${search}%`
                }
              },
              {
                notes: {
                  [Op.iLike]: `%${search}%`
                }
              }
            ]
          }
        : undefined,
      limit,
      offset: (page - 1) * limit,
      order: [["createdAt", "DESC"]]
    });

    return {
      clients: rows.map((client) => this.toClientDto(client)),
      totalItems: count
    };
  }

  public async create(input: CreateClientRequestDto): Promise<ClientDto> {
    const client = await ClientModel.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      cpf: input.cpf ?? "",
      notes: input.notes
    });

    return this.toClientDto(client);
  }

  public async update(id: number, input: UpdateClientRequestDto): Promise<ClientDto | null> {
    const client = await ClientModel.findByPk(id);

    if (!client) {
      return null;
    }

    client.name = input.name;
    client.email = input.email;
    client.phone = input.phone;
    client.cpf = input.cpf ?? "";
    client.notes = input.notes;

    await client.save();

    return this.toClientDto(client);
  }

  public async delete(id: number): Promise<boolean> {
    const deletedCount = await ClientModel.destroy({
      where: {
        id
      }
    });

    return deletedCount > 0;
  }

  private toClientDto(client: ClientModel): ClientDto {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      cpf: client.cpf ?? "",
      notes: client.notes
    };
  }
}
