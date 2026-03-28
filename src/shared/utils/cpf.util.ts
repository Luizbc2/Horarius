export const normalizeCpf = (value: string): string => value.replace(/\D/g, "").slice(0, 11);

export const isValidCpf = (value: string): boolean => {
  const cpf = normalizeCpf(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split("").map(Number);

  const firstCheckDigit = calculateCheckDigit(digits.slice(0, 9), 10);
  const secondCheckDigit = calculateCheckDigit(digits.slice(0, 10), 11);

  return firstCheckDigit === digits[9] && secondCheckDigit === digits[10];
};

const calculateCheckDigit = (digits: number[], weightStart: number): number => {
  const total = digits.reduce((sum, digit, index) => sum + digit * (weightStart - index), 0);
  const remainder = (total * 10) % 11;

  return remainder === 10 ? 0 : remainder;
};
