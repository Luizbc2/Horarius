import {
  CreateProfessionalRequestDto,
  ListProfessionalsQueryDto,
  ProfessionalDto,
  ProfessionalWorkDayDto,
  ProfessionalWorkDayInputDto,
  UpdateProfessionalRequestDto,
} from "../../modules/professionals/dtos/professional.dto";
import {
  ListProfessionalsRepositoryResult,
  ProfessionalRepository,
} from "../../modules/professionals/repositories/professional.repository";

type InMemoryProfessionalRepositoryOptions = {
  professionals?: ProfessionalDto[];
  workDaysByProfessionalId?: Record<number, ProfessionalWorkDayDto[]>;
};

export class InMemoryProfessionalRepository implements ProfessionalRepository {
  private readonly professionals: ProfessionalDto[];
  private readonly workDaysByProfessionalId: Map<number, ProfessionalWorkDayDto[]>;
  private nextProfessionalId: number;
  private nextWorkDayId: number;

  constructor(options: InMemoryProfessionalRepositoryOptions = {}) {
    this.professionals = options.professionals ? [...options.professionals] : [];
    this.workDaysByProfessionalId = new Map(
      Object.entries(options.workDaysByProfessionalId ?? {}).map(([professionalId, workDays]) => [
        Number(professionalId),
        [...workDays],
      ]),
    );
    this.nextProfessionalId =
      this.professionals.reduce((highestId, professional) => Math.max(highestId, professional.id), 0) + 1;
    this.nextWorkDayId =
      Math.max(
        0,
        ...Array.from(this.workDaysByProfessionalId.values()).flat().map((workDay) => workDay.id),
      ) + 1;
  }

  public async findById(id: number): Promise<ProfessionalDto | null> {
    return this.professionals.find((professional) => professional.id === id) ?? null;
  }

  public async findWorkDaysByProfessionalId(professionalId: number): Promise<ProfessionalWorkDayDto[] | null> {
    if (!(await this.findById(professionalId))) {
      return null;
    }

    return [...(this.workDaysByProfessionalId.get(professionalId) ?? [])];
  }

  public async list(
    query: Required<ListProfessionalsQueryDto> & { limit: number },
  ): Promise<ListProfessionalsRepositoryResult> {
    const normalizedSearch = query.search.trim().toLowerCase();
    const filteredProfessionals = normalizedSearch
      ? this.professionals.filter((professional) =>
          `${professional.name} ${professional.email} ${professional.phone} ${professional.specialty} ${professional.status}`
            .toLowerCase()
            .includes(normalizedSearch),
        )
      : this.professionals;
    const startIndex = (query.page - 1) * query.limit;

    return {
      professionals: filteredProfessionals.slice(startIndex, startIndex + query.limit),
      totalItems: filteredProfessionals.length,
    };
  }

  public async create(input: CreateProfessionalRequestDto): Promise<ProfessionalDto> {
    const createdProfessional: ProfessionalDto = {
      id: this.nextProfessionalId++,
      name: input.name,
      email: input.email,
      phone: input.phone,
      specialty: input.specialty,
      status: input.status,
    };

    this.professionals.push(createdProfessional);

    return createdProfessional;
  }

  public async update(id: number, input: UpdateProfessionalRequestDto): Promise<ProfessionalDto | null> {
    const professionalIndex = this.professionals.findIndex((professional) => professional.id === id);

    if (professionalIndex === -1) {
      return null;
    }

    const currentProfessional = this.professionals[professionalIndex];

    if (!currentProfessional) {
      return null;
    }

    const updatedProfessional: ProfessionalDto = {
      ...currentProfessional,
      name: input.name,
      email: input.email,
      phone: input.phone,
      specialty: input.specialty,
      status: input.status,
    };

    this.professionals[professionalIndex] = updatedProfessional;

    return updatedProfessional;
  }

  public async replaceWorkDays(
    professionalId: number,
    workDays: ProfessionalWorkDayInputDto[],
  ): Promise<ProfessionalWorkDayDto[] | null> {
    if (!(await this.findById(professionalId))) {
      return null;
    }

    const nextWorkDays = workDays.map((workDay) => ({
      id: this.nextWorkDayId++,
      professionalId,
      dayOfWeek: workDay.dayOfWeek,
      enabled: workDay.enabled,
      startTime: workDay.startTime,
      endTime: workDay.endTime,
      breakStart: workDay.breakStart ?? null,
      breakEnd: workDay.breakEnd ?? null,
    }));

    this.workDaysByProfessionalId.set(professionalId, nextWorkDays);

    return [...nextWorkDays];
  }

  public async delete(id: number): Promise<boolean> {
    const professionalIndex = this.professionals.findIndex((professional) => professional.id === id);

    if (professionalIndex === -1) {
      return false;
    }

    this.professionals.splice(professionalIndex, 1);
    this.workDaysByProfessionalId.delete(id);

    return true;
  }
}
