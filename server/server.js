/* =========================================================
   Armário Social — Servidor web + API REST
   - Serve as páginas estáticas do front-end (HTML/CSS/JS).
   - Expõe a API em /api (pontos, doações, patrocinadores).
   Inicie com: npm start  (ou npm run dev para auto-reload)
   ========================================================= */
require("dotenv").config();
const path = require("path");
const { execSync } = require("child_process");
const express = require("express");

const prisma = require("./prismaClient");
const authRouter = require("./routes/auth");
const pontosRouter = require("./routes/pontos");
const doacoesRouter = require("./routes/doacoes");
const patrocinadoresRouter = require("./routes/patrocinadores");
const parceirosRouter = require("./routes/parceiros");
const relatoriosRouter = require("./routes/relatorios");

const app = express();
const PORTA = Number(process.env.PORT) || 3000;

// Lê o corpo JSON das requisições (POST/PATCH).
app.use(express.json());

// Servir o front-end estático (as páginas ficam em server/frontend).
app.use(express.static(path.join(__dirname, "frontend")));

// Rotas da API.
app.use("/api", authRouter); // /api/login, /api/me
app.use("/api", relatoriosRouter); // /api/estoque, /api/redistribuicoes
app.use("/api/pontos", pontosRouter);
app.use("/api/doacoes", doacoesRouter);
app.use("/api/patrocinadores", patrocinadoresRouter);
app.use("/api/parceiros", parceirosRouter);

// Qualquer rota /api desconhecida vira 404 em JSON.
app.use("/api", (req, res) => {
  res.status(404).json({ erro: "Rota da API não encontrada." });
});

// Tratamento central de erros.
app.use((erro, req, res, next) => {
  // Corpo JSON malformado (body-parser) é erro do cliente -> 400, não 500.
  if (erro.type === "entity.parse.failed" || erro.status === 400) {
    return res.status(400).json({ erro: "Requisição inválida (JSON malformado)." });
  }
  console.error("Erro na API:", erro);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

// Garante que o schema do banco esteja aplicado (tabelas criadas) antes de
// começar a atender requisições. Aplica as migrations versionadas em
// prisma/migrations/. É idempotente: num banco já atualizado, é um no-op rápido.
function aplicarMigrations() {
  try {
    console.log("Aplicando migrations do banco (prisma migrate deploy)...");
    execSync("npx prisma migrate deploy", { stdio: "inherit", cwd: __dirname });
  } catch (erro) {
    console.error("Falha ao aplicar as migrations do banco:", erro.message);
    process.exit(1);
  }
}

aplicarMigrations();

const servidor = app.listen(PORTA, () => {
  console.log(`Armário Social rodando em http://localhost:${PORTA}`);
});

// Encerramento limpo: fecha o servidor e a conexão do Prisma.
for (const sinal of ["SIGINT", "SIGTERM"]) {
  process.on(sinal, () => {
    servidor.close(() => {
      prisma.$disconnect().finally(() => process.exit(0));
    });
  });
}
