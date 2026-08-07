import { isValidCpf, normalizeCpf } from "../../shared/utils/cpf.util";

describe("CPF utils", () => {
  it("remove pontuacao antes de validar o CPF", () => {
    expect(normalizeCpf("529.982.247-25")).toBe("52998224725");
    expect(isValidCpf("529.982.247-25")).toBe(true);
  });

  it("recusa CPF com todos os digitos repetidos", () => {
    expect(isValidCpf("11111111111")).toBe(false);
  });

  it("recusa CPF com digitos verificadores invalidos", () => {
    expect(isValidCpf("52998224724")).toBe(false);
  });
});
