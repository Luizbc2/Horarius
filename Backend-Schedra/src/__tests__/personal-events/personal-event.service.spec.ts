import type { PersonalEventDto, PersonalEventInput } from "../../modules/personal-events/dtos/personal-event.dto";
import type { PersonalEventRepository } from "../../modules/personal-events/repositories/personal-event.repository";
import { PersonalEventService } from "../../modules/personal-events/services/personal-event.service";

class InMemoryPersonalEventRepository implements PersonalEventRepository {
  events: PersonalEventDto[] = [];
  lastUserId = 0;

  async list() { return this.events; }
  async create(userId: number, input: PersonalEventInput) { this.lastUserId = userId; const event = { id: 1, ...input }; this.events.push(event); return event; }
  async update(_userId: number, id: number, input: PersonalEventInput) { return this.events.some((event) => event.id === id) ? { id, ...input } : null; }
  async delete(_userId: number, id: number) { return this.events.some((event) => event.id === id); }
}

const validInput: PersonalEventInput = {
  title: "Psicólogo",
  startsAt: "2026-08-12T18:00:00.000Z",
  endsAt: "2026-08-12T19:00:00.000Z",
  location: "Clínica central",
  notes: "Levar exames",
  reminderMinutes: 30,
  completed: false,
};

describe("PersonalEventService", () => {
  it("cria compromisso pessoal para o usuário autenticado", async () => {
    const repository = new InMemoryPersonalEventRepository();
    const result = await new PersonalEventService(repository).create(42, validInput);

    expect(result.success).toBe(true);
    expect(repository.lastUserId).toBe(42);
    expect(repository.events[0]?.title).toBe("Psicólogo");
  });

  it("recusa término anterior ao início", async () => {
    const result = await new PersonalEventService(new InMemoryPersonalEventRepository()).create(1, {
      ...validInput,
      endsAt: "2026-08-12T17:00:00.000Z",
    });

    expect(result).toEqual({ success: false, status: 400, message: "O término deve acontecer depois do início." });
  });
});
