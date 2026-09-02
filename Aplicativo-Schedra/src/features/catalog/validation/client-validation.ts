import type { ClientInput } from "../api/clients-api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidCpf(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (!cpf) return true;
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Number(cpf[index]) * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

export function validateClient(input: ClientInput) {
  if (input.name.trim().length < 2) return "Informe um nome com pelo menos 2 caracteres.";
  if (!emailPattern.test(input.email.trim())) return "Informe um e-mail valido.";
  const phone = input.phone.replace(/\D/g, "");
  if (phone.length < 10 || phone.length > 11) return "Informe um telefone com DDD.";
  if (!isValidCpf(input.cpf)) return "Informe um CPF valido ou deixe o campo vazio.";
  if (input.notes.trim() && input.notes.trim().length < 3) return "A observacao deve ter ao menos 3 caracteres.";
  return null;
}
