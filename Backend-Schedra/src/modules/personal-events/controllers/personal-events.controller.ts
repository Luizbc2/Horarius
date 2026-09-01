import type { Request, Response } from "express";
import { getAuthenticatedUserId } from "../../auth/utils/auth-request.util";
import { asNumber, asRequestBody, asString } from "../../../shared/http/request-parser";
import { SequelizePersonalEventRepository } from "../repositories/personal-event.repository";
import { PersonalEventService } from "../services/personal-event.service";
import { recordRequestAudit } from "../../../shared/http/request-audit";

const service = new PersonalEventService(new SequelizePersonalEventRepository());

export class PersonalEventsController {
  async list(request: Request, response: Response) {
    const userId = getAuthenticatedUserId(request);
    if (!userId) return response.status(401).json({ message: "Usuário não autenticado." });
    return response.json({ items: await service.list(userId) });
  }

  async create(request: Request, response: Response) { return this.save(request, response); }
  async update(request: Request, response: Response) { return this.save(request, response, Number(request.params.id)); }

  async delete(request: Request, response: Response) {
    const userId = getAuthenticatedUserId(request);
    if (!userId) return response.status(401).json({ message: "Usuário não autenticado." });
    const result = await service.delete(userId, Number(request.params.id));
    if (!result.success) return response.status(result.status).json({ message: result.message });
    await recordRequestAudit(request, "personal_event.deleted", "personal_event", Number(request.params.id), undefined, null);
    return response.json({ message: "Compromisso removido." });
  }

  private async save(request: Request, response: Response, id?: number) {
    const userId = getAuthenticatedUserId(request);
    if (!userId) return response.status(401).json({ message: "Usuário não autenticado." });
    const body = asRequestBody(request.body);
    const input = { title: asString(body.title), startsAt: asString(body.startsAt), endsAt: asString(body.endsAt), location: asString(body.location), notes: asString(body.notes), reminderMinutes: asNumber(body.reminderMinutes) ?? 30, completed: body.completed === true };
    const result = id ? await service.update(userId, id, input) : await service.create(userId, input);
    if (!result.success) return response.status(result.status).json({ message: result.message });
    await recordRequestAudit(request, id ? "personal_event.updated" : "personal_event.created", "personal_event", result.data.id, undefined, null);
    return response.status(id ? 200 : 201).json({ message: "Compromisso salvo.", event: result.data });
  }
}
