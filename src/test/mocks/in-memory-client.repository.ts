import {
  ClientDto,
  CreateClientRequestDto,
  ListClientsQueryDto,
  UpdateClientRequestDto,
} from "../../modules/clients/dtos/client.dto";
import {
  ClientRepository,
  ListClientsRepositoryResult,
} from "../../modules/clients/repositories/client.repository";

type InMemoryClientRepositoryOptions = {
  clients?: ClientDto[];
};

export class InMemoryClientRepository implements ClientRepository {
  private readonly clients: ClientDto[];
  private nextId: number;

  constructor(options: InMemoryClientRepositoryOptions = {}) {
    this.clients = options.clients ? [...options.clients] : [];
    this.nextId = this.clients.reduce((highestId, client) => Math.max(highestId, client.id), 0) + 1;
  }

  public async findById(id: number): Promise<ClientDto | null> {
    return this.clients.find((client) => client.id === id) ?? null;
  }

  public async list(query: Required<ListClientsQueryDto> & { limit: number }): Promise<ListClientsRepositoryResult> {
    const normalizedSearch = query.search.trim().toLowerCase();
    const filteredClients = normalizedSearch
      ? this.clients.filter((client) =>
          `${client.name} ${client.email} ${client.phone} ${client.cpf} ${client.notes}`
            .toLowerCase()
            .includes(normalizedSearch),
        )
      : this.clients;
    const startIndex = (query.page - 1) * query.limit;

    return {
      clients: filteredClients.slice(startIndex, startIndex + query.limit),
      totalItems: filteredClients.length,
    };
  }

  public async create(input: CreateClientRequestDto): Promise<ClientDto> {
    const createdClient: ClientDto = {
      id: this.nextId++,
      name: input.name,
      email: input.email,
      phone: input.phone,
      cpf: input.cpf ?? "",
      notes: input.notes,
    };

    this.clients.push(createdClient);

    return createdClient;
  }

  public async update(id: number, input: UpdateClientRequestDto): Promise<ClientDto | null> {
    const clientIndex = this.clients.findIndex((client) => client.id === id);

    if (clientIndex === -1) {
      return null;
    }

    const currentClient = this.clients[clientIndex];

    if (!currentClient) {
      return null;
    }

    const updatedClient: ClientDto = {
      ...currentClient,
      name: input.name,
      email: input.email,
      phone: input.phone,
      cpf: input.cpf ?? "",
      notes: input.notes,
    };

    this.clients[clientIndex] = updatedClient;

    return updatedClient;
  }

  public async delete(id: number): Promise<boolean> {
    const clientIndex = this.clients.findIndex((client) => client.id === id);

    if (clientIndex === -1) {
      return false;
    }

    this.clients.splice(clientIndex, 1);
    return true;
  }
}
