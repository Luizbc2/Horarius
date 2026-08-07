import { comparePassword, hashPassword, isPasswordHashed } from "../../modules/auth/utils/password.util";

describe("Password utils", () => {
  it("gera hash sem salvar a senha em texto puro", async () => {
    const hash = await hashPassword("Senha123");

    expect(hash).not.toBe("Senha123");
    expect(isPasswordHashed(hash)).toBe(true);
  });

  it("confirma a senha correta pelo hash", async () => {
    const hash = await hashPassword("Senha123");

    await expect(comparePassword("Senha123", hash)).resolves.toBe(true);
  });

  it("recusa senha incorreta", async () => {
    const hash = await hashPassword("Senha123");

    await expect(comparePassword("Senha456", hash)).resolves.toBe(false);
  });
});
