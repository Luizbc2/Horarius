import { isValidEmail } from "../../shared/utils/email.util";

describe("Email utils", () => {
  it("aceita um e-mail bem formatado", () => {
    expect(isValidEmail("usuario@horarius.com")).toBe(true);
  });

  it("ignora espacos no inicio e no fim", () => {
    expect(isValidEmail("  usuario@horarius.com  ")).toBe(true);
  });

  it("recusa e-mail sem dominio completo", () => {
    expect(isValidEmail("usuario@horarius")).toBe(false);
  });
});
