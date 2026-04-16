import {
  CreateServiceRequestDto,
  ListServicesQueryDto,
  ServiceDto,
  UpdateServiceRequestDto,
} from "../../modules/services/dtos/service.dto";
import {
  ListServicesRepositoryResult,
  ServiceRepository,
} from "../../modules/services/repositories/service.repository";

type InMemoryServiceRepositoryOptions = {
  services?: ServiceDto[];
};

export class InMemoryServiceRepository implements ServiceRepository {
  private readonly services: ServiceDto[];
  private nextId: number;

  constructor(options: InMemoryServiceRepositoryOptions = {}) {
    this.services = options.services ? [...options.services] : [];
    this.nextId = this.services.reduce((highestId, service) => Math.max(highestId, service.id), 0) + 1;
  }

  public async findById(id: number): Promise<ServiceDto | null> {
    return this.services.find((service) => service.id === id) ?? null;
  }

  public async list(query: Required<ListServicesQueryDto> & { limit: number }): Promise<ListServicesRepositoryResult> {
    const normalizedSearch = query.search.trim().toLowerCase();
    const filteredServices = normalizedSearch
      ? this.services.filter((service) =>
          `${service.name} ${service.category} ${service.description}`.toLowerCase().includes(normalizedSearch),
        )
      : this.services;
    const startIndex = (query.page - 1) * query.limit;

    return {
      services: filteredServices.slice(startIndex, startIndex + query.limit),
      totalItems: filteredServices.length,
    };
  }

  public async create(input: CreateServiceRequestDto): Promise<ServiceDto> {
    const createdService: ServiceDto = {
      id: this.nextId++,
      name: input.name,
      category: input.category,
      durationMinutes: input.durationMinutes,
      price: input.price,
      description: input.description,
    };

    this.services.push(createdService);

    return createdService;
  }

  public async update(id: number, input: UpdateServiceRequestDto): Promise<ServiceDto | null> {
    const serviceIndex = this.services.findIndex((service) => service.id === id);

    if (serviceIndex === -1) {
      return null;
    }

    const currentService = this.services[serviceIndex];

    if (!currentService) {
      return null;
    }

    const updatedService: ServiceDto = {
      ...currentService,
      name: input.name,
      category: input.category,
      durationMinutes: input.durationMinutes,
      price: input.price,
      description: input.description,
    };

    this.services[serviceIndex] = updatedService;

    return updatedService;
  }

  public async delete(id: number): Promise<boolean> {
    const serviceIndex = this.services.findIndex((service) => service.id === id);

    if (serviceIndex === -1) {
      return false;
    }

    this.services.splice(serviceIndex, 1);
    return true;
  }
}
