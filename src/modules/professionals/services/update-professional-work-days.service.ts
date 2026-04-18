import { ValidationError } from "sequelize";

import {
  ProfessionalWorkDayDto,
  ProfessionalWorkDayInputDto,
  UpdateProfessionalWorkDaysRequestDto,
} from "../dtos/professional.dto";
import { ProfessionalRepository } from "../repositories/professional.repository";

type UpdateProfessionalWorkDaysResponseDto = {
  message: string;
  workDays: ProfessionalWorkDayDto[];
};

type UpdateProfessionalWorkDaysServiceResult =
  | {
      success: true;
      data: UpdateProfessionalWorkDaysResponseDto;
    }
  | {
      success: false;
      message: string;
      statusCode: number;
    };

const VALID_WEEK_DAYS = new Set([
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
]);
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class UpdateProfessionalWorkDaysService {
  constructor(private readonly professionalRepository: ProfessionalRepository) {}

  public async execute(
    userId: number,
    professionalId: number,
    input: UpdateProfessionalWorkDaysRequestDto,
  ): Promise<UpdateProfessionalWorkDaysServiceResult> {
    if (!userId || !professionalId) {
      return {
        success: false,
        message: "Usuário autenticado e id do profissional são obrigatórios.",
        statusCode: 400,
      };
    }

    if (!Array.isArray(input.workDays)) {
      return {
        success: false,
        message: "A lista de horários do profissional é obrigatória.",
        statusCode: 400,
      };
    }

    const normalizedWorkDays = this.normalizeWorkDays(input.workDays);
    const validationMessage = this.validateWorkDays(normalizedWorkDays);

    if (validationMessage) {
      return {
        success: false,
        message: validationMessage,
        statusCode: 400,
      };
    }

    try {
      const workDays = await this.professionalRepository.replaceWorkDays(
        userId,
        professionalId,
        normalizedWorkDays,
      );

      if (workDays === null) {
        return {
          success: false,
          message: "Profissional não encontrado.",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: {
          message: "Horarios do profissional atualizados com sucesso.",
          workDays,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          message: "Dados dos horários do profissional são inválidos.",
          statusCode: 400,
        };
      }

      throw error;
    }
  }

  private normalizeWorkDays(workDays: ProfessionalWorkDayInputDto[]): ProfessionalWorkDayInputDto[] {
    return workDays.map((workDay) => ({
      dayOfWeek: workDay.dayOfWeek.trim().toLowerCase(),
      enabled: Boolean(workDay.enabled),
      startTime: workDay.startTime.trim(),
      endTime: workDay.endTime.trim(),
      breakStart: workDay.breakStart?.trim() || null,
      breakEnd: workDay.breakEnd?.trim() || null,
    }));
  }

  private validateWorkDays(workDays: ProfessionalWorkDayInputDto[]): string | null {
    const usedDays = new Set<string>();

    for (const workDay of workDays) {
      if (!VALID_WEEK_DAYS.has(workDay.dayOfWeek)) {
        return "Dia da semana invalido nos horarios do profissional.";
      }

      if (usedDays.has(workDay.dayOfWeek)) {
        return "Nao e permitido repetir o mesmo dia da semana.";
      }

      usedDays.add(workDay.dayOfWeek);

      if (!workDay.startTime || !workDay.endTime) {
        return "Horario inicial e final sao obrigatorios em todos os dias informados.";
      }

      if (!this.isValidTime(workDay.startTime) || !this.isValidTime(workDay.endTime)) {
        return "Os horarios do profissional devem seguir o formato HH:MM.";
      }

      if (this.toMinutes(workDay.startTime) >= this.toMinutes(workDay.endTime)) {
        return "O horario inicial deve ser anterior ao horario final.";
      }

      const hasBreakStart = Boolean(workDay.breakStart);
      const hasBreakEnd = Boolean(workDay.breakEnd);

      if (hasBreakStart !== hasBreakEnd) {
        return "O intervalo do profissional deve informar inicio e fim juntos.";
      }

      if (workDay.breakStart && workDay.breakEnd) {
        if (!this.isValidTime(workDay.breakStart) || !this.isValidTime(workDay.breakEnd)) {
          return "Os horarios do profissional devem seguir o formato HH:MM.";
        }

        if (this.toMinutes(workDay.breakStart) >= this.toMinutes(workDay.breakEnd)) {
          return "O inicio do intervalo deve ser anterior ao fim do intervalo.";
        }

        if (
          this.toMinutes(workDay.breakStart) <= this.toMinutes(workDay.startTime) ||
          this.toMinutes(workDay.breakEnd) >= this.toMinutes(workDay.endTime)
        ) {
          return "O intervalo deve estar dentro da jornada do profissional.";
        }
      }
    }

    return null;
  }

  private isValidTime(value: string): boolean {
    return TIME_PATTERN.test(value);
  }

  private toMinutes(value: string): number {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }
}
