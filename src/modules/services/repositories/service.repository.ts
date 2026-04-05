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
  findById(id: number): Promise<ServiceDto | null>;
  list(query: Required<ListServicesQueryDto> & { limit: number }): Promise<ListServicesRepositoryResult>;
  create(input: CreateServiceRequestDto): Promise<ServiceDto>;
  update(id: number, input: UpdateServiceRequestDto): Promise<ServiceDto | null>;
  delete(id: number): Promise<boolean>;
}
