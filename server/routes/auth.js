/* =========================================================
   Armário Social — Rotas de autenticação
     POST /api/login  -> valida login (admin do .env ou parceiro do banco)
     GET  /api/me     -> (protegido) dados do usuário do token atual
   ========================================================= */
const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");
const { wrap, textoNaoVazio } = require("./helpers");
const { assinarToken, requireAuth } = require("../auth");

const router = express.Router();

const ADMIN_USUARIO = process.env.ADMIN_USUARIO || "";
const ADMIN_SENHA = process.env.ADMIN_SENHA || "";

/* Login: tenta admin (credenciais do .env) e depois parceiro (banco). */
router.post(
  "/login",
  wrap(async (req, res) => {
    const { usuario, senha } = req.body;
    if (!textoNaoVazio(usuario) || !textoNaoVazio(senha)) {
      return res.status(400).json({ erro: "Informe usuário e senha." });
    }
    const user = usuario.trim();

    // 1) Administrador (vem do .env).
    if (ADMIN_USUARIO && user === ADMIN_USUARIO && senha === ADMIN_SENHA) {
      const token = assinarToken({ id: 0, usuario: ADMIN_USUARIO, role: "admin" });
      return res.json({
        token,
        usuario: ADMIN_USUARIO,
        nome: "Administrador",
        role: "admin",
      });
    }

    // 2) Parceiro (conta no banco, senha com hash).
    const parceiro = await prisma.parceiro.findUnique({ where: { usuario: user } });
    if (parceiro && bcrypt.compareSync(senha, parceiro.senhaHash)) {
      const token = assinarToken({
        id: parceiro.id,
        usuario: parceiro.usuario,
        role: "parceiro",
      });
      return res.json({
        token,
        usuario: parceiro.usuario,
        nome: parceiro.nome,
        role: "parceiro",
      });
    }

    return res.status(401).json({ erro: "Usuário ou senha inválidos." });
  })
);

/* Confirma a sessão atual (usado pelo front para validar o token e o papel). */
router.get(
  "/me",
  requireAuth,
  wrap(async (req, res) => {
    if (req.usuario.role === "admin") {
      return res.json({
        usuario: req.usuario.usuario,
        nome: "Administrador",
        role: "admin",
      });
    }
    // Parceiro: confirma que a conta ainda existe no banco.
    const parceiro = await prisma.parceiro.findUnique({
      where: { id: req.usuario.id },
      select: { usuario: true, nome: true },
    });
    if (!parceiro) {
      return res.status(401).json({ erro: "Sessão inválida." });
    }
    res.json({ usuario: parceiro.usuario, nome: parceiro.nome, role: "parceiro" });
  })
);

module.exports = router;
