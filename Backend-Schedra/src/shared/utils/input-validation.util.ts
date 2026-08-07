export const INPUT_LIMITS = {
  category: 80,
  clientName: 120,
  description: 500,
  email: 120,
  name: 120,
  notes: 500,
  password: 72,
  phoneDigits: 11,
  specialty: 80,
} as const;

export function normalizeSingleLineText(value: string | undefined, maxLength: number): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

export function normalizeMultiLineText(value: string | undefined, maxLength: number): string {
  return (value ?? "").replace(/\r\n/g, "\n").trim();
}

export function normalizePhone(value: string | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

export function isValidPhone(value: string): boolean {
  return value.length === 10 || value.length === 11;
}

export function hasTextLengthBetween(value: string, minLength: number, maxLength: number): boolean {
  return value.length >= minLength && value.length <= maxLength;
}

export function isPositiveInteger(value: number, maxValue?: number): boolean {
  return Number.isInteger(value) && value > 0 && (maxValue === undefined || value <= maxValue);
}

export function isNonNegativeAmount(value: number, maxValue?: number): boolean {
  if (!Number.isFinite(value) || value < 0) {
    return false;
  }

  if (maxValue !== undefined && value > maxValue) {
    return false;
  }

  return Number(value.toFixed(2)) === value;
}
