/** Valida formato de e-mail básico */
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

/** Verifica se string não está vazia após trim */
export const isNotEmpty = (value: string): boolean => value.trim().length > 0
