import {
  CreateServiceRequestDto,
  ListServicesQueryDto,
  ServiceDto,
  UpdateServiceRequestDto,
} from "../dtos/service.dto";

export type ListServicesRepositoryResult = {
  services: ServiceDto[];
  totalItems: number;
};

export interface ServiceRepository {
  findById(userId: number, id: number): Promise<ServiceDto | null>;
  list(
    userId: number,
    query: Required<ListServicesQueryDto> & { limit: number },
  ): Promise<ListServicesRepositoryResult>;
  create(userId: number, input: CreateServiceRequestDto): Promise<ServiceDto>;
  update(userId: number, id: number, input: UpdateServiceRequestDto): Promise<ServiceDto | null>;
  delete(userId: number, id: number): Promise<boolean>;
}
