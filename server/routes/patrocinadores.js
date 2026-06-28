/* =========================================================
   Armário Social — Rotas de Patrocinadores / Apoiadores
     GET    /api/patrocinadores                 -> lista todos
     GET    /api/patrocinadores?aprovado=true   -> só aprovados
     POST   /api/patrocinadores                 -> cadastra (pendente)
     DELETE /api/patrocinadores/:id             -> remove
     PATCH  /api/patrocinadores/:id/aprovar     -> aprova
   ========================================================= */
const express = require("express");
const prisma = require("../prismaClient");
const { wrap, textoNaoVazio, formatarDataBR } = require("./helpers");
const { requireAdmin } = require("../auth");

const router = express.Router();

/* Ajusta um registro do Prisma: a data vira "DD/MM/AAAA HH:MM". */
function formatarPatrocinador(p) {
  return { ...p, data: formatarDataBR(p.data) };
}

/* Lista PÚBLICA: só os aprovados. Usada no mural da página inicial e no
   painel em modo visualização (usuário comum). */
router.get(
  "/aprovados",
  wrap(async (req, res) => {
    const lista = await prisma.patrocinador.findMany({
      where: { aprovado: true },
      orderBy: { id: "asc" },
    });
    res.json(lista.map(formatarPatrocinador));
  })
);

/* Lista COMPLETA (inclui pendentes). Somente admin (gerencia aprovações). */
router.get(
  "/",
  requireAdmin,
  wrap(async (req, res) => {
    const lista = await prisma.patrocinador.findMany({ orderBy: { id: "asc" } });
    res.json(lista.map(formatarPatrocinador));
  })
);

/* Cadastra um novo patrocinador/apoiador (entra como pendente). */
router.post(
  "/",
  wrap(async (req, res) => {
    const { nome, responsavel, contato, site, nivel, mensagem } = req.body;

    if (
      !textoNaoVazio(nome) ||
      !textoNaoVazio(responsavel) ||
      !textoNaoVazio(contato) ||
      !textoNaoVazio(nivel)
    ) {
      return res
        .status(400)
        .json({ erro: "Informe nome, responsável, contato e o nível de apoio." });
    }

    const novo = await prisma.patrocinador.create({
      data: {
        nome: nome.trim(),
        responsavel: responsavel.trim(),
        contato: contato.trim(),
        site: textoNaoVazio(site) ? site.trim() : "",
        nivel: nivel.trim(),
        mensagem: textoNaoVazio(mensagem) ? mensagem.trim() : "",
      },
    });
    res.status(201).json(formatarPatrocinador(novo));
  })
);

/* Remove um patrocinador pelo id (somente admin). */
router.delete(
  "/:id",
  requireAdmin,
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ erro: "Id inválido." });
    }
    try {
      await prisma.patrocinador.delete({ where: { id } });
      res.status(204).end();
    } catch (erro) {
      if (erro.code === "P2025") {
        return res.status(404).json({ erro: "Patrocinador não encontrado." });
      }
      throw erro;
    }
  })
);

/* Aprova um patrocinador (somente admin). */
router.patch(
  "/:id/aprovar",
  requireAdmin,
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ erro: "Id inválido." });
    }
    try {
      const atualizado = await prisma.patrocinador.update({
        where: { id },
        data: { aprovado: true },
      });
      res.json(formatarPatrocinador(atualizado));
    } catch (erro) {
      if (erro.code === "P2025") {
        return res.status(404).json({ erro: "Patrocinador não encontrado." });
      }
      throw erro;
    }
  })
);

module.exports = router;
