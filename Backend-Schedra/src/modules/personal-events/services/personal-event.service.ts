import type { PersonalEventInput } from "../dtos/personal-event.dto";
import type { PersonalEventRepository } from "../repositories/personal-event.repository";

export class PersonalEventService {
  constructor(private readonly repository: PersonalEventRepository) {}

  list(userId: number) { return this.repository.list(userId); }

  async create(userId: number, input: PersonalEventInput) {
    const error = this.validate(input);
    return error ? { success: false as const, status: 400, message: error } : { success: true as const, data: await this.repository.create(userId, input) };
  }

  async update(userId: number, id: number, input: PersonalEventInput) {
    const error = this.validate(input);
    if (error) return { success: false as const, status: 400, message: error };
    const data = await this.repository.update(userId, id, input);
    return data ? { success: true as const, data } : { success: false as const, status: 404, message: "Compromisso não encontrado." };
  }

  async delete(userId: number, id: number) {
    return await this.repository.delete(userId, id)
      ? { success: true as const }
      : { success: false as const, status: 404, message: "Compromisso não encontrado." };
  }

  private validate(input: PersonalEventInput) {
    if (!input.title.trim()) return "O título é obrigatório.";
    if (input.title.trim().length > 120) return "O título deve ter no máximo 120 caracteres.";
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return "Data e hora inválidas.";
    if (endsAt <= startsAt) return "O término deve acontecer depois do início.";
    if (input.reminderMinutes < 0 || input.reminderMinutes > 10080) return "O lembrete deve estar entre 0 e 10080 minutos.";
    return null;
  }
}
