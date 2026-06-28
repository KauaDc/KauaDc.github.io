-- CreateTable
CREATE TABLE "pontos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "pecas" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "pontos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doacoes" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "ponto_id" INTEGER,
    "ponto_nome" TEXT NOT NULL,
    "pecas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "observacoes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "doacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patrocinadores" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome" TEXT NOT NULL,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "responsavel" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "site" TEXT NOT NULL DEFAULT '',
    "nivel" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "patrocinadores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doacoes_ponto_id_idx" ON "doacoes"("ponto_id");

-- AddForeignKey
ALTER TABLE "doacoes" ADD CONSTRAINT "doacoes_ponto_id_fkey" FOREIGN KEY ("ponto_id") REFERENCES "pontos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
