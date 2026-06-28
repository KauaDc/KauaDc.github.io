-- CreateTable
CREATE TABLE "parceiros" (
    "id" SERIAL NOT NULL,
    "usuario" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT '',
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parceiros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parceiros_usuario_key" ON "parceiros"("usuario");
