/* =========================================================
   Armário Social — Contas de Parceiro (somente admin)
     GET    /api/parceiros      -> lista as contas (sem a senha)
     POST   /api/parceiros      -> cria uma conta { usuario, senha, nome }
     DELETE /api/parceiros/:id  -> remove uma conta
   ========================================================= */
const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");
const { wrap, textoNaoVazio, formatarDataBR } = require("./helpers");
const { requireAdmin } = require("../auth");

const router = express.Router();

// Todas as rotas de contas exigem administrador.
router.use(requireAdmin);

function formatarParceiro(p) {
  return {
    id: p.id,
    usuario: p.usuario,
    nome: p.nome,
    criadoEm: formatarDataBR(p.criadoEm),
  };
}

/* Lista as contas de parceiro (nunca devolve a senha/hash). */
router.get(
  "/",
  wrap(async (req, res) => {
    const lista = await prisma.parceiro.findMany({
      orderBy: { id: "asc" },
      select: { id: true, usuario: true, nome: true, criadoEm: true },
    });
    res.json(lista.map(formatarParceiro));
  })
);

/* Cria uma nova conta de parceiro. */
router.post(
  "/",
  wrap(async (req, res) => {
    const { usuario, senha, nome } = req.body;
    if (!textoNaoVazio(usuario) || !textoNaoVazio(senha)) {
      return res.status(400).json({ erro: "Informe usuário e senha." });
    }
    try {
      const novo = await prisma.parceiro.create({
        data: {
          usuario: usuario.trim(),
          senhaHash: bcrypt.hashSync(senha, 10),
          nome: textoNaoVazio(nome) ? nome.trim() : "",
        },
        select: { id: true, usuario: true, nome: true, criadoEm: true },
      });
      res.status(201).json(formatarParceiro(novo));
    } catch (erro) {
      if (erro.code === "P2002") {
        return res
          .status(409)
          .json({ erro: "Já existe um parceiro com esse usuário." });
      }
      throw erro;
    }
  })
);

/* Remove uma conta de parceiro. */
router.delete(
  "/:id",
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ erro: "Id inválido." });
    }
    try {
      await prisma.parceiro.delete({ where: { id } });
      res.status(204).end();
    } catch (erro) {
      if (erro.code === "P2025") {
        return res.status(404).json({ erro: "Parceiro não encontrado." });
      }
      throw erro;
    }
  })
);

module.exports = router;
