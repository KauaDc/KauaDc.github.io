/* =========================================================
   Armário Social — Seed (dados iniciais via Prisma)
   Reproduz os pontos, doações e patrocinadores fictícios que
   antes ficavam no localStorage. É idempotente: limpa as tabelas
   e reinsere os dados, então pode ser executado várias vezes.
   Rodado automaticamente por "prisma migrate dev" e "migrate reset",
   ou manualmente com "npm run db:seed".
   ========================================================= */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../prismaClient");

// Conta de parceiro padrão — APENAS para desenvolvimento/demonstração.
// Troque a senha em produção (ou cadastre outras contas).
const PARCEIRO_PADRAO = {
  usuario: "parceiro",
  senha: "parceiro123",
  nome: "Parceiro Demonstração",
};

const PONTOS = [
  { id: 1, nome: "Paróquia São José", responsavel: "Pe. Antônio Bianchi", email: "contato@paroquiasaojose.org.br", endereco: "Rua Independência, 420", bairro: "Centro", cidade: "São Leopoldo", horario: "Seg a Sex, 8h às 17h", pecas: ["Casacos", "Cobertores", "Roupas infantis"] },
  { id: 2, nome: "Mercado Solidário Bom Preço", responsavel: "Marina Schmitt", email: "contato@mercadobompreco.com.br", endereco: "Av. Pedro Adams Filho, 1500", bairro: "Vila Rosa", cidade: "Novo Hamburgo", horario: "Seg a Sáb, 9h às 19h", pecas: ["Blusas de frio", "Calças", "Calçados"] },
  { id: 3, nome: "Centro Comunitário Esperança", responsavel: "João Pereira", email: "contato@centroesperanca.org.br", endereco: "Rua Os Dezoito do Forte, 230", bairro: "São Pelegrino", cidade: "Caxias do Sul", horario: "Seg a Sex, 13h às 18h", pecas: ["Casacos", "Cobertores", "Cachecóis e toucas", "Meias e luvas"] },
  { id: 4, nome: "Farmácia Vida Plena", responsavel: "Cláudia Oliveira", email: "contato@farmaciavidaplena.com.br", endereco: "Av. Ipiranga, 3000", bairro: "Partenon", cidade: "Porto Alegre", horario: "Todos os dias, 8h às 22h", pecas: ["Blusas de frio", "Cachecóis e toucas", "Meias e luvas"] },
  { id: 5, nome: "Escola Municipal Frei Pacífico", responsavel: "Diretora Helena Costa", email: "contato@escolafreipacifico.edu.br", endereco: "Rua Brasil, 88", bairro: "Rio Branco", cidade: "São Leopoldo", horario: "Seg a Sex, 7h30 às 16h30", pecas: ["Roupas infantis", "Casacos", "Calçados"] },
  { id: 6, nome: "Padaria Pão Quente", responsavel: "Roberto Lima", email: "contato@padariapaoquente.com.br", endereco: "Rua General Osório, 745", bairro: "Centro", cidade: "Novo Hamburgo", horario: "Seg a Sáb, 6h às 20h", pecas: ["Blusas de frio", "Cobertores"] },
  { id: 7, nome: "Academia Movimento", responsavel: "Patrícia Fontes", email: "contato@academiamovimento.com.br", endereco: "Av. Júlio de Castilhos, 2100", bairro: "Lourdes", cidade: "Caxias do Sul", horario: "Seg a Sex, 6h às 23h", pecas: ["Casacos", "Calças", "Meias e luvas"] },
  { id: 8, nome: "Loja Bem Estar", responsavel: "Fernando Souza", email: "contato@lojabemestar.com.br", endereco: "Rua dos Andradas, 1234", bairro: "Centro Histórico", cidade: "Porto Alegre", horario: "Seg a Sex, 9h às 18h", pecas: ["Casacos", "Blusas de frio", "Calçados", "Cachecóis e toucas"] },
];

const DOACOES = [
  { id: 1, data: new Date("2026-05-26T09:15:00-03:00"), nome: "Maria Oliveira", contato: "maria.oliveira@email.com", pontoId: 1, pontoNome: "Paróquia São José (São Leopoldo)", pecas: ["Casacos", "Cobertores"], quantidade: 5, observacoes: "Peças lavadas e dobradas." },
  { id: 2, data: new Date("2026-05-27T16:40:00-03:00"), nome: "João Pereira", contato: "(51) 99876-1234", pontoId: 1, pontoNome: "Paróquia São José (São Leopoldo)", pecas: ["Roupas infantis", "Calçados"], quantidade: 4, observacoes: "" },
  { id: 3, data: new Date("2026-05-28T11:05:00-03:00"), nome: "Ana Souza", contato: "ana.souza@email.com", pontoId: 2, pontoNome: "Mercado Solidário Bom Preço (Novo Hamburgo)", pecas: ["Blusas de frio", "Calças"], quantidade: 6, observacoes: "Tamanhos variados." },
  { id: 4, data: new Date("2026-05-29T14:20:00-03:00"), nome: "Carlos Lima", contato: "(54) 99123-4567", pontoId: 3, pontoNome: "Centro Comunitário Esperança (Caxias do Sul)", pecas: ["Cobertores", "Meias e luvas"], quantidade: 3, observacoes: "" },
  { id: 5, data: new Date("2026-05-30T10:50:00-03:00"), nome: "Fernanda Costa", contato: "fernanda.costa@email.com", pontoId: 4, pontoNome: "Farmácia Vida Plena (Porto Alegre)", pecas: ["Cachecóis e toucas", "Casacos"], quantidade: 8, observacoes: "Doação da campanha do prédio." },
  { id: 6, data: new Date("2026-05-31T18:30:00-03:00"), nome: "Roberto Alves", contato: "(51) 98765-4321", pontoId: 6, pontoNome: "Padaria Pão Quente (Novo Hamburgo)", pecas: ["Cobertores", "Roupas infantis"], quantidade: 2, observacoes: "" },
  { id: 7, data: new Date("2026-06-01T13:10:00-03:00"), nome: "Patrícia Gomes", contato: "patricia.gomes@email.com", pontoId: 8, pontoNome: "Loja Bem Estar (Porto Alegre)", pecas: ["Calçados", "Blusas de frio"], quantidade: 7, observacoes: "Calçados em bom estado." },
  { id: 8, data: new Date("2026-05-27T08:50:00-03:00"), nome: "Lucas Martins", contato: "lucas.martins@email.com", pontoId: 5, pontoNome: "Escola Municipal Frei Pacífico (São Leopoldo)", pecas: ["Roupas infantis", "Casacos"], quantidade: 5, observacoes: "Roupas de criança de 4 a 8 anos." },
  { id: 9, data: new Date("2026-05-28T17:25:00-03:00"), nome: "Juliana Reis", contato: "(51) 99432-8810", pontoId: 5, pontoNome: "Escola Municipal Frei Pacífico (São Leopoldo)", pecas: ["Cobertores"], quantidade: 3, observacoes: "" },
  { id: 10, data: new Date("2026-05-29T09:40:00-03:00"), nome: "Marcos Vieira", contato: "marcos.vieira@email.com", pontoId: 7, pontoNome: "Academia Movimento (Caxias do Sul)", pecas: ["Calças", "Meias e luvas"], quantidade: 4, observacoes: "" },
  { id: 11, data: new Date("2026-05-30T19:05:00-03:00"), nome: "Beatriz Nunes", contato: "(54) 99777-2031", pontoId: 7, pontoNome: "Academia Movimento (Caxias do Sul)", pecas: ["Blusas de frio"], quantidade: 6, observacoes: "Blusas de moletom novas." },
  { id: 12, data: new Date("2026-05-31T12:15:00-03:00"), nome: "Rafael Carvalho", contato: "rafael.carvalho@email.com", pontoId: 3, pontoNome: "Centro Comunitário Esperança (Caxias do Sul)", pecas: ["Cachecóis e toucas", "Casacos"], quantidade: 5, observacoes: "" },
  { id: 13, data: new Date("2026-06-01T15:50:00-03:00"), nome: "Camila Ferreira", contato: "camila.ferreira@email.com", pontoId: 2, pontoNome: "Mercado Solidário Bom Preço (Novo Hamburgo)", pecas: ["Calçados", "Cobertores"], quantidade: 4, observacoes: "Cobertores de casal." },
];

const PATROCINADORES = [
  { id: 1, data: new Date("2026-05-20T10:00:00-03:00"), nome: "Malhas Serra", aprovado: false, responsavel: "Sandra Boff", contato: "contato@malhasserra.com.br", site: "https://www.malhasserra.com.br", nivel: "Patrocinador", mensagem: "Vamos doar malhas novas a cada campanha de inverno." },
  { id: 2, data: new Date("2026-05-22T15:30:00-03:00"), nome: "Rádio Comunitária Vale", aprovado: false, responsavel: "Pedro Antunes", contato: "(51) 99555-0102", site: "", nivel: "Apoiador", mensagem: "Divulgaremos a campanha na nossa programação." },
  { id: 3, data: new Date("2026-05-24T09:45:00-03:00"), nome: "Gráfica Imprime Bem", aprovado: false, responsavel: "Letícia Martins", contato: "contato@imprimebem.com.br", site: "", nivel: "Apoiador", mensagem: "" },
];

async function main() {
  // Limpa em ordem de dependência (doações referenciam pontos).
  await prisma.doacao.deleteMany();
  await prisma.patrocinador.deleteMany();
  await prisma.ponto.deleteMany();
  await prisma.parceiro.deleteMany();

  await prisma.ponto.createMany({ data: PONTOS });
  await prisma.doacao.createMany({ data: DOACOES });
  await prisma.patrocinador.createMany({ data: PATROCINADORES });

  // Conta de parceiro padrão (senha guardada como hash bcrypt).
  await prisma.parceiro.create({
    data: {
      usuario: PARCEIRO_PADRAO.usuario,
      senhaHash: bcrypt.hashSync(PARCEIRO_PADRAO.senha, 10),
      nome: PARCEIRO_PADRAO.nome,
    },
  });

  // Os ids foram informados manualmente; realinha as sequências para que
  // os próximos cadastros continuem após o maior id inserido.
  await prisma.$executeRawUnsafe("SELECT setval('pontos_id_seq', (SELECT MAX(id) FROM pontos))");
  await prisma.$executeRawUnsafe("SELECT setval('doacoes_id_seq', (SELECT MAX(id) FROM doacoes))");
  await prisma.$executeRawUnsafe("SELECT setval('patrocinadores_id_seq', (SELECT MAX(id) FROM patrocinadores))");

  console.log(
    `Seed concluído: ${PONTOS.length} pontos, ${DOACOES.length} doações, ${PATROCINADORES.length} patrocinadores.`
  );
  console.log(
    `Conta de parceiro padrão: usuário "${PARCEIRO_PADRAO.usuario}" / senha "${PARCEIRO_PADRAO.senha}" (troque depois).`
  );
}

main()
  .catch((erro) => {
    console.error("Falha no seed:", erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
