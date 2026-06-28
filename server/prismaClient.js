/* =========================================================
   Armário Social — Cliente do Prisma
   Instância única do PrismaClient, compartilhada por toda a
   aplicação (rotas e seed). A conexão vem de DATABASE_URL (.env).
   ========================================================= */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
