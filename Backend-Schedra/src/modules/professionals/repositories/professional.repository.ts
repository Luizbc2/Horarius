import {
  CreateProfessionalRequestDto,
  ProfessionalWorkDayDto,
  ProfessionalWorkDayInputDto,
  ListProfessionalsQueryDto,
  ProfessionalDto,
  UpdateProfessionalRequestDto,
} from "../dtos/professional.dto";

export type ListProfessionalsRepositoryResult = {
  professionals: ProfessionalDto[];
  totalItems: number;
};

export interface ProfessionalRepository {
  findById(userId: number, id: number): Promise<ProfessionalDto | null>;
  findWorkDaysByProfessionalId(
    userId: number,
    professionalId: number,
  ): Promise<ProfessionalWorkDayDto[] | null>;
  list(
    userId: number,
    query: Required<ListProfessionalsQueryDto> & { limit: number },
  ): Promise<ListProfessionalsRepositoryResult>;
  create(userId: number, input: CreateProfessionalRequestDto): Promise<ProfessionalDto>;
  update(userId: number, id: number, input: UpdateProfessionalRequestDto): Promise<ProfessionalDto | null>;
  replaceWorkDays(
    userId: number,
    professionalId: number,
    workDays: ProfessionalWorkDayInputDto[],
  ): Promise<ProfessionalWorkDayDto[] | null>;
  delete(userId: number, id: number): Promise<boolean>;
}
