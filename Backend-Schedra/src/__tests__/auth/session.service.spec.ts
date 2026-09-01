import { createHash } from "node:crypto";

import { UserModel } from "../../modules/auth/models/user.model";
import type {
  AuthSessionRecord,
  CreateAuthSessionInput,
  SessionRepository,
} from "../../modules/auth/repositories/session.repository";
import { SessionService } from "../../modules/auth/services/session.service";
import type { TenantService } from "../../platform/tenancy/tenant.service";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const workspace = {
  id: 7,
  name: "Schedra Teste",
  slug: "schedra-teste",
  membershipId: 11,
  role: "owner" as const,
  permissions: ["appointments:read" as const],
};

class MemorySessionRepository implements SessionRepository {
  public rotateResult = true;
  public record: AuthSessionRecord = {
    id: 3,
    userId: 1,
    organizationId: workspace.id,
    refreshTokenHash: hash("refresh-original"),
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    lastUsedAt: new Date(),
  };

  async create(_input: CreateAuthSessionInput) { return this.record; }
  async findById(id: number) { return id === this.record.id ? this.record : null; }
  async findByRefreshTokenHash(value: string) { return value === this.record.refreshTokenHash ? this.record : null; }
  async rotate(_id: number, current: string, next: string) {
    if (!this.rotateResult || current !== this.record.refreshTokenHash) return false;
    this.record.refreshTokenHash = next;
    return true;
  }
  async setOrganization(_id: number, organizationId: number) { this.record.organizationId = organizationId; }
  async revoke() { this.record.revokedAt = new Date(); }
  async revokeAllForUser() { this.record.revokedAt = new Date(); }
  async revokeAllForUserExcept(_userId: number, sessionId: number) {
    if (this.record.id !== sessionId) this.record.revokedAt = new Date();
  }
}

describe("SessionService", () => {
  const user = {
    id: 1,
    name: "Ana",
    email: "ana@schedra.app",
    cpf: "52998224725",
    password: "hash",
    accountType: "business" as const,
    role: "user" as const,
    active: true,
    avatarUrl: null,
  } as UserModel;
  const tenancy = {
    resolveForUser: jest.fn().mockResolvedValue(workspace),
  } as unknown as TenantService;

  beforeEach(() => {
    jest.spyOn(UserModel, "findByPk").mockResolvedValue(user);
  });

  afterEach(() => jest.restoreAllMocks());

  it("rotaciona o refresh token com compare-and-swap", async () => {
    const repository = new MemorySessionRepository();
    const result = await new SessionService(repository, tenancy).rotate("refresh-original");
    expect(result?.session.refreshToken).toBeTruthy();
    expect(repository.record.refreshTokenHash).not.toBe(hash("refresh-original"));
  });

  it("recusa uma rotação concorrente que perdeu a disputa", async () => {
    const repository = new MemorySessionRepository();
    repository.rotateResult = false;
    expect(await new SessionService(repository, tenancy).rotate("refresh-original")).toBeNull();
  });
});
