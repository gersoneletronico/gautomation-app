// Número do orçamento: ddMMyyHHmm no momento da criação. Nunca muda em edições.
export function gerarNumeroOrcamento(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(date.getDate());
  const MM = pad(date.getMonth() + 1);
  const yy = pad(date.getFullYear() % 100);
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${dd}${MM}${yy}${HH}${mm}`;
}
