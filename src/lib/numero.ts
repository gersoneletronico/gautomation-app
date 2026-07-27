const TIMEZONE = "America/Sao_Paulo";

function partesBrasilia(date: Date) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    dd: parts.day,
    MM: parts.month,
    yy: parts.year,
    HH: parts.hour === "24" ? "00" : parts.hour,
    mm: parts.minute,
  };
}

// Número do orçamento: ddMMyyHHmm no horário de Brasília, no momento da criação. Nunca muda em edições.
export function gerarNumeroOrcamento(date = new Date()) {
  const { dd, MM, yy, HH, mm } = partesBrasilia(date);
  return `${dd}${MM}${yy}${HH}${mm}`;
}

// Data de emissão (YYYY-MM-DD) no horário de Brasília.
export function dataEmissaoBrasilia(date = new Date()) {
  const { dd, MM, yy } = partesBrasilia(date);
  return `20${yy}-${MM}-${dd}`;
}
