import { ListProfessionalsQueryDto, ProfessionalDto } from "../dtos/professional.dto";
import { ProfessionalRepository } from "../repositories/professional.repository";

type ListProfessionalsResponseDto = {
  data: ProfessionalDto[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

type ListProfessionalsServiceResult = {
  success: true;
  data: ListProfessionalsResponseDto;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 6;

export class ListProfessionalsService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(
    userId: number,
    query: ListProfessionalsQueryDto,
  ): Promise<ListProfessionalsServiceResult> {
    const page = this.normalizePositiveNumber(query.page, DEFAULT_PAGE);
    const limit = this.normalizePositiveNumber(query.limit, DEFAULT_LIMIT);
    const search = query.search?.trim() ?? "";

    const { professionals, totalItems } = await this.professionalRepository.list(userId, {
      page,
      limit,
      search,
    });

    return {
      success: true,
      data: {
        data: professionals,
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
