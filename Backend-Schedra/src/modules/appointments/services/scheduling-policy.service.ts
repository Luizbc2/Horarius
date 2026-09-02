import { Op, type Model, type ModelStatic } from "sequelize";

import { database } from "../../../config/database";
import { resolveActiveOrganizationTimeZone } from "../../../platform/tenancy/organization-timezone.service";
import { getZonedDateKey, getZonedDateParts } from "../../../shared/utils/time-zone.util";
import { ProfessionalWorkDayModel } from "../../professionals/models/professional-work-day.model";

type DynamicRecord = Model<Record<string, unknown>, Record<string, unknown>>;
type SchedulingPolicyResult = { valid: true } | { valid: false; message: string };

const DAY_NAMES = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const toMinutes = (value: string): number => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export class SchedulingPolicyService {
  public async validate(
    professionalId: number,
    serviceId: number,
    startsAt: Date,
    endsAt: Date,
  ): Promise<SchedulingPolicyResult> {
    const serviceValidation = await this.validateProfessionalService(professionalId, serviceId);
    if (!serviceValidation.valid) return serviceValidation;
    const workDayValidation = await this.validateWorkDay(professionalId, startsAt, endsAt);
    if (!workDayValidation.valid) return workDayValidation;
    return this.validateTimeOff(professionalId, startsAt, endsAt);
  }

  private async validateProfessionalService(professionalId: number, serviceId: number): Promise<SchedulingPolicyResult> {
    const model = database.getConnection().models.ProfessionalService as ModelStatic<DynamicRecord> | undefined;
    if (!model) return { valid: true };
    const assignments = await model.count({ where: { professionalId } });
    if (assignments === 0) return { valid: true };
    return await model.findOne({ where: { professionalId, serviceId } })
      ? { valid: true }
      : { valid: false, message: "O profissional selecionado não executa este serviço." };
  }

  private async validateWorkDay(professionalId: number, startsAt: Date, endsAt: Date): Promise<SchedulingPolicyResult> {
    if (await ProfessionalWorkDayModel.count({ where: { professionalId } }) === 0) return { valid: true };
    const timeZone = await resolveActiveOrganizationTimeZone();
    const start = getZonedDateParts(startsAt, timeZone);
    const end = getZonedDateParts(endsAt, timeZone);
    const dayOfWeek = new Date(Date.UTC(start.year, start.month - 1, start.day)).getUTCDay();
    const workDay = await ProfessionalWorkDayModel.findOne({
      where: { professionalId, dayOfWeek: DAY_NAMES[dayOfWeek] },
    });
    if (!workDay?.enabled) return { valid: false, message: "O profissional não atende no dia selecionado." };
    if (getZonedDateKey(startsAt, timeZone) !== getZonedDateKey(endsAt, timeZone)) {
      return { valid: false, message: "O atendimento precisa começar e terminar no mesmo dia." };
    }
    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;
    if (startMinutes < toMinutes(workDay.startTime) || endMinutes > toMinutes(workDay.endTime)) {
      return { valid: false, message: "O horário está fora da jornada do profissional." };
    }
    if (workDay.breakStart && workDay.breakEnd) {
      const breakStart = toMinutes(workDay.breakStart);
      const breakEnd = toMinutes(workDay.breakEnd);
      if (startMinutes < breakEnd && endMinutes > breakStart) {
        return { valid: false, message: "O horário coincide com o intervalo do profissional." };
      }
    }
    return { valid: true };
  }

  private async validateTimeOff(professionalId: number, startsAt: Date, endsAt: Date): Promise<SchedulingPolicyResult> {
    const model = database.getConnection().models.ProfessionalTimeOff as ModelStatic<DynamicRecord> | undefined;
    if (!model) return { valid: true };
    const conflict = await model.findOne({
      where: { professionalId, startsAt: { [Op.lt]: endsAt }, endsAt: { [Op.gt]: startsAt } },
    });
    return conflict
      ? { valid: false, message: "O profissional possui um bloqueio nesse intervalo." }
      : { valid: true };
  }
}
