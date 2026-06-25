export const validatePasswordStrength = (value: string): string | null => {
  if (value.trim().length < 8) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }

  if (!/[A-Z]/.test(value)) {
    return "A senha deve incluir pelo menos uma letra maiuscula.";
  }

  if (!/[a-z]/.test(value)) {
    return "A senha deve incluir pelo menos uma letra minuscula.";
  }

  if (!/\d/.test(value)) {
    return "A senha deve incluir pelo menos um numero.";
  }

  return null;
};
