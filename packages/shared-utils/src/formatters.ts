/** Remove acentos e normaliza string para comparação */
export const normalizeString = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/** Capitaliza a primeira letra */
export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

/** Trunca texto para exibição */
export const truncate = (str: string, maxLength = 80) =>
  str.length <= maxLength ? str : `${str.slice(0, maxLength)}…`
