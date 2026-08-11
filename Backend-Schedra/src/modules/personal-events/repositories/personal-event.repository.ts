import type { PersonalEventDto, PersonalEventInput } from "../dtos/personal-event.dto";
import { PersonalEventModel } from "../models/personal-event.model";

export interface PersonalEventRepository {
  list(userId: number): Promise<PersonalEventDto[]>;
  create(userId: number, input: PersonalEventInput): Promise<PersonalEventDto>;
  update(userId: number, id: number, input: PersonalEventInput): Promise<PersonalEventDto | null>;
  delete(userId: number, id: number): Promise<boolean>;
}

export class SequelizePersonalEventRepository implements PersonalEventRepository {
  async list(userId: number) {
    const events = await PersonalEventModel.findAll({ where: { userId }, order: [["startsAt", "ASC"]] });
    return events.map(this.toDto);
  }

  async create(userId: number, input: PersonalEventInput) {
    return this.toDto(await PersonalEventModel.create({ ...input, userId, startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt) }));
  }

  async update(userId: number, id: number, input: PersonalEventInput) {
    const event = await PersonalEventModel.findOne({ where: { id, userId } });
    if (!event) return null;
    await event.update({ ...input, startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt) });
    return this.toDto(event);
  }

  async delete(userId: number, id: number) {
    return (await PersonalEventModel.destroy({ where: { id, userId } })) > 0;
  }

  private toDto(event: PersonalEventModel): PersonalEventDto {
    return { id: event.id, title: event.title, startsAt: event.startsAt.toISOString(), endsAt: event.endsAt.toISOString(), location: event.location, notes: event.notes, reminderMinutes: event.reminderMinutes, completed: event.completed };
  }
}
