/* =========================================================
   Armário Social — Rotas de Doações
     GET    /api/doacoes      -> lista todas
     POST   /api/doacoes      -> registra uma nova
     DELETE /api/doacoes/:id  -> remove
   ========================================================= */
const express = require("express");
const prisma = require("../prismaClient");
const { wrap, textoNaoVazio, normalizarPecas, formatarDataBR } = require("./helpers");
const { requireAdmin } = require("../auth");

const router = express.Router();

/* Ajusta um registro do Prisma para o formato que o front-end espera:
   a data vira "DD/MM/AAAA HH:MM". As chaves pontoId/pontoNome já saem em
   camelCase por causa do @map no schema. */
function formatarDoacao(d) {
  return { ...d, data: formatarDataBR(d.data) };
}

/* Lista todas as doações (mais antigas primeiro). Restrito ao ADMIN: contém
   dados pessoais dos doadores (nome e contato). */
router.get(
  "/",
  requireAdmin,
  wrap(async (req, res) => {
    const doacoes = await prisma.doacao.findMany({ orderBy: { id: "asc" } });
    res.json(doacoes.map(formatarDoacao));
  })
);

/* Registra uma nova doação. */
router.post(
  "/",
  wrap(async (req, res) => {
    const { nome, contato, pontoId, pontoNome, observacoes } = req.body;
    const pecas = normalizarPecas(req.body.pecas);
    const quantidade = Number(req.body.quantidade) || 0;

    if (!textoNaoVazio(nome) || !textoNaoVazio(contato) || pecas.length === 0) {
      return res
        .status(400)
        .json({ erro: "Informe nome, contato e ao menos um tipo de peça." });
    }
    if (!Number.isInteger(Number(pontoId))) {
      return res.status(400).json({ erro: "Ponto de coleta inválido." });
    }

    try {
      const doacao = await prisma.doacao.create({
        data: {
          nome: nome.trim(),
          contato: contato.trim(),
          pontoId: Number(pontoId),
          pontoNome: textoNaoVazio(pontoNome)
            ? pontoNome.trim()
            : "Ponto não identificado",
          pecas,
          quantidade,
          observacoes: textoNaoVazio(observacoes) ? observacoes.trim() : "",
        },
      });
      res.status(201).json(formatarDoacao(doacao));
    } catch (erro) {
      // Ponto inexistente (violação de chave estrangeira).
      if (erro.code === "P2003") {
        return res.status(400).json({ erro: "Ponto de coleta não encontrado." });
      }
      throw erro;
    }
  })
);

/* Remove uma doação pelo id (somente admin). */
router.delete(
  "/:id",
  requireAdmin,
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ erro: "Id inválido." });
    }
    try {
      await prisma.doacao.delete({ where: { id } });
      res.status(204).end();
    } catch (erro) {
      if (erro.code === "P2025") {
        return res.status(404).json({ erro: "Doação não encontrada." });
      }
      throw erro;
    }
  })
);

module.exports = router;
