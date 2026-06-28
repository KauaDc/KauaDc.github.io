/* =========================================================
   Armário Social — Utilidades das rotas
   ========================================================= */

/* Envolve um handler assíncrono para que erros caiam no
   tratador central de erros do Express (evita try/catch repetido). */
function wrap(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

/* Verifica se um valor é uma string não vazia (após trim). */
function textoNaoVazio(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

/* Normaliza uma lista de peças vinda do cliente para um array de strings. */
function normalizarPecas(pecas) {
  if (!Array.isArray(pecas)) return [];
  return pecas.filter((p) => typeof p === "string" && p.trim().length > 0);
}

/* Formatador reutilizável: data/hora no fuso de São Paulo. */
const _fmtDataBR = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/* Converte um objeto Date (vindo do Prisma) para a string "DD/MM/AAAA HH:MM"
   que o front-end exibe diretamente. Substitui o antigo to_char do SQL. */
function formatarDataBR(data) {
  const p = Object.fromEntries(
    _fmtDataBR.formatToParts(data).map((parte) => [parte.type, parte.value])
  );
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

module.exports = { wrap, textoNaoVazio, normalizarPecas, formatarDataBR };
