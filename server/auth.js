/* =========================================================
   Armário Social — Autenticação e papéis (JWT)
   Papéis: "admin" (super usuário, vem do .env) e "parceiro"
   (conta no banco). O token guarda o papel.
   - assinarToken: gera o token para um usuário logado.
   - requireAuth:  exige qualquer login válido (parceiro ou admin).
   - requireAdmin: exige login de admin.
   ========================================================= */
const jwt = require("jsonwebtoken");

const SEGREDO =
  process.env.JWT_SECRET || "armario-social-dev-secret-troque-isto";
const EXPIRA_EM = "8h";

if (!process.env.JWT_SECRET) {
  console.warn(
    "AVISO: JWT_SECRET não definido no .env — usando um segredo de desenvolvimento. Defina um valor próprio."
  );
}

/* Gera um token JWT. usuario = { id, usuario, role }. */
function assinarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, usuario: usuario.usuario, role: usuario.role },
    SEGREDO,
    { expiresIn: EXPIRA_EM }
  );
}

/* Lê e valida o token do cabeçalho Authorization: Bearer <token>. */
function lerToken(req) {
  const cabecalho = req.headers.authorization || "";
  const [tipo, token] = cabecalho.split(" ");
  if (tipo !== "Bearer" || !token) return null;
  try {
    return jwt.verify(token, SEGREDO);
  } catch (erro) {
    return null;
  }
}

/* Exige qualquer login válido (parceiro OU admin). */
function requireAuth(req, res, next) {
  const usuario = lerToken(req);
  if (!usuario) {
    return res.status(401).json({ erro: "Faça login para continuar." });
  }
  req.usuario = usuario;
  next();
}

/* Exige login de ADMINISTRADOR. */
function requireAdmin(req, res, next) {
  const usuario = lerToken(req);
  if (!usuario) {
    return res.status(401).json({ erro: "Faça login para continuar." });
  }
  if (usuario.role !== "admin") {
    return res
      .status(403)
      .json({ erro: "Ação restrita ao administrador." });
  }
  req.usuario = usuario;
  next();
}

module.exports = { assinarToken, requireAuth, requireAdmin };
