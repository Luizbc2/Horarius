import { isValidEmail } from "../../shared/utils/email.util";

describe("Email utils", () => {
  it("aceita um e-mail bem formatado", () => {
    expect(isValidEmail("usuario@schedra.com")).toBe(true);
  });

  it("ignora espacos no inicio e no fim", () => {
    expect(isValidEmail("  usuario@schedra.com  ")).toBe(true);
  });

  it("recusa e-mail sem dominio completo", () => {
    expect(isValidEmail("usuario@schedra")).toBe(false);
  });
});
