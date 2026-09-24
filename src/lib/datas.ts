// Datas guardadas em UTC e mostradas sempre em hora de Lisboa (RNF19).
// Toda a formatação de datas para o utilizador passa por este módulo.

export const FUSO_HORARIO = "Europe/Lisbon";
const LOCALE = "pt-PT";

type EntradaData = Date | string | number;

const formatoDataHora = new Intl.DateTimeFormat(LOCALE, {
  timeZone: FUSO_HORARIO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const formatoData = new Intl.DateTimeFormat(LOCALE, {
  timeZone: FUSO_HORARIO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatoHora = new Intl.DateTimeFormat(LOCALE, {
  timeZone: FUSO_HORARIO,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function paraData(valor: EntradaData): Date {
  const data = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(data.getTime())) {
    throw new RangeError(`Data inválida: ${String(valor)}`);
  }
  return data;
}

/** Ex.: "24/09/2026, 14:30" */
export function formatarDataHora(valor: EntradaData): string {
  return formatoDataHora.format(paraData(valor));
}

/** Ex.: "24/09/2026" */
export function formatarData(valor: EntradaData): string {
  return formatoData.format(paraData(valor));
}

/** Ex.: "14:30" */
export function formatarHora(valor: EntradaData): string {
  return formatoHora.format(paraData(valor));
}
