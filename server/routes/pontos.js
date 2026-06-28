/* =========================================================
   Armário Social — Rotas de Pontos de coleta
     GET    /api/pontos            -> lista todos
     POST   /api/pontos            -> cria um novo
     DELETE /api/pontos/:id        -> remove
     PATCH  /api/pontos/:id/pecas  -> atualiza os itens necessários
   ========================================================= */
const express = require("express");
const prisma = require("../prismaClient");
const { wrap, textoNaoVazio, normalizarPecas } = require("./helpers");
const { requireAuth, requireAdmin } = require("../auth");

const router = express.Router();

/* Lista todos os pontos. */
router.get(
  "/",
  wrap(async (req, res) => {
    const pontos = await prisma.ponto.findMany({ orderBy: { id: "asc" } });
    res.json(pontos);
  })
);

/* Cria um novo ponto de coleta. */
router.post(
  "/",
  wrap(async (req, res) => {
    const { nome, responsavel, email, endereco, bairro, cidade, horario } = req.body;
    const pecas = normalizarPecas(req.body.pecas);

    if (
      ![nome, responsavel, email, endereco, bairro, cidade, horario].every(textoNaoVazio)
    ) {
      return res
        .status(400)
        .json({ erro: "Preencha nome, responsável, e-mail, endereço, bairro, cidade e horário." });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ erro: "Informe um e-mail válido." });
    }

    const ponto = await prisma.ponto.create({
      data: {
        nome: nome.trim(),
        responsavel: responsavel.trim(),
        email: email.trim(),
        endereco: endereco.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        horario: horario.trim(),
        pecas,
      },
    });
    res.status(201).json(ponto);
  })
);

/* Remove um ponto pelo id. As doações associadas são mantidas
   (a coluna ponto_id vira NULL, conforme o onDelete: SetNull do schema). */
router.delete(
  "/:id",
  requireAdmin,
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ erro: "Id inválido." });
    }
    try {
      await prisma.ponto.delete({ where: { id } });
      res.status(204).end();
    } catch (erro) {
      if (erro.code === "P2025") {
        return res.status(404).json({ erro: "Ponto não encontrado." });
      }
      throw erro;
    }
  })
);

/* Atualiza apenas os itens que o ponto precisa no momento. */
router.patch(
  "/:id/pecas",
  requireAuth,
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ erro: "Id inválido." });
    }
    const pecas = normalizarPecas(req.body.pecas);
    try {
      const ponto = await prisma.ponto.update({ where: { id }, data: { pecas } });
      res.json(ponto);
    } catch (erro) {
      if (erro.code === "P2025") {
        return res.status(404).json({ erro: "Ponto não encontrado." });
      }
      throw erro;
    }
  })
);

module.exports = router;
