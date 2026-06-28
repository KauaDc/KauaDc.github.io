/* =========================================================
   Armário Social — Relatórios agregados (públicos)
     GET /api/estoque          -> o que cada ponto recebeu
     GET /api/redistribuicoes  -> itens excedentes e destinos
   Devolvem apenas dados agregados (peças/quantidades por ponto),
   sem nomes ou contatos de doadores — por isso são públicos.
   ========================================================= */
const express = require("express");
const prisma = require("../prismaClient");
const { wrap } = require("./helpers");
const { calcularEstoque, calcularRedistribuicoes } = require("../estoque");

const router = express.Router();

/* Carrega pontos e doações do banco. Das doações pega só o necessário
   para o cálculo (nada de nome/contato do doador). */
async function carregarDados() {
  const [pontos, doacoes] = await Promise.all([
    prisma.ponto.findMany({ orderBy: { id: "asc" } }),
    prisma.doacao.findMany({
      select: { pontoId: true, pecas: true, quantidade: true },
    }),
  ]);
  return { pontos, doacoes };
}

router.get(
  "/estoque",
  wrap(async (req, res) => {
    const { pontos, doacoes } = await carregarDados();
    res.json(calcularEstoque(pontos, doacoes));
  })
);

router.get(
  "/redistribuicoes",
  wrap(async (req, res) => {
    const { pontos, doacoes } = await carregarDados();
    res.json(calcularRedistribuicoes(pontos, doacoes));
  })
);

module.exports = router;
