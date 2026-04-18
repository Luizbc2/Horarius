import {
  ClientDto,
  CreateClientRequestDto,
  ListClientsQueryDto,
  UpdateClientRequestDto
} from "../dtos/client.dto";

export type ListClientsRepositoryResult = {
  clients: ClientDto[];
  totalItems: number;
};

export interface ClientRepository {
  findById(userId: number, id: number): Promise<ClientDto | null>;
  list(
    userId: number,
    query: Required<ListClientsQueryDto> & { limit: number },
  ): Promise<ListClientsRepositoryResult>;
  create(userId: number, input: CreateClientRequestDto): Promise<ClientDto>;
  update(userId: number, id: number, input: UpdateClientRequestDto): Promise<ClientDto | null>;
  delete(userId: number, id: number): Promise<boolean>;
}
