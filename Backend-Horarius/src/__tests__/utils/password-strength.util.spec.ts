import { validatePasswordStrength } from "../../shared/utils/password-strength.util";

describe("Password strength utils", () => {
  it("aprova uma senha forte", () => {
    expect(validatePasswordStrength("Senha123")).toBeNull();
  });

  it("recusa senha curta", () => {
    expect(validatePasswordStrength("Senh12")).toBe("A senha deve ter pelo menos 8 caracteres.");
  });

  it("recusa senha sem letra maiuscula", () => {
    expect(validatePasswordStrength("senha123")).toBe("A senha deve incluir pelo menos uma letra maiuscula.");
  });

  it("recusa senha sem numero", () => {
    expect(validatePasswordStrength("SenhaForte")).toBe("A senha deve incluir pelo menos um numero.");
  });
});
