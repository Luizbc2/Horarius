import { ListServicesQueryDto, ServiceDto } from "../dtos/service.dto";
import { ServiceRepository } from "../repositories/service.repository";

type ListServicesResponseDto = {
  data: ServiceDto[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

type ListServicesServiceResult = {
  success: true;
  data: ListServicesResponseDto;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;

export class ListServicesService {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  public async execute(userId: number, query: ListServicesQueryDto): Promise<ListServicesServiceResult> {
    const page = this.normalizePositiveNumber(query.page, DEFAULT_PAGE);
    const limit = this.normalizePositiveNumber(query.limit, DEFAULT_LIMIT);
    const search = query.search?.trim() ?? "";

    const { services, totalItems } = await this.serviceRepository.list(userId, {
      page,
      limit,
      search,
    });

    return {
      success: true,
      data: {
        data: services,
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  }

  private normalizePositiveNumber(value: number | undefined, fallback: number): number {
    if (!value || Number.isNaN(value)) {
      return fallback;
    }

    return Math.max(1, Math.trunc(value));
  }
}
