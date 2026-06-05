/* =========================================================
   Armário Social — Módulo de dados e persistência
   Responsável por:
   - Guardar os tipos de peças disponíveis
   - Pré-popular os pontos de coleta fictícios
   - Ler e gravar pontos e doações no localStorage
   ========================================================= */

/* Chaves usadas no localStorage */
const CHAVE_PONTOS = "armario_social_pontos";
const CHAVE_DOACOES = "armario_social_doacoes";
const CHAVE_PATROCINADORES = "armario_social_patrocinadores";

/* Tipos de peças aceitas (usado em vários formulários) */
const TIPOS_DE_PECA = [
  "Casacos",
  "Blusas de frio",
  "Cobertores",
  "Calças",
  "Calçados",
  "Cachecóis e toucas",
  "Roupas infantis",
  "Meias e luvas",
];

/* Pontos de coleta fictícios usados na primeira execução.
   Cidades reais do Rio Grande do Sul. */
const PONTOS_INICIAIS = [
  {
    id: 1,
    nome: "Paróquia São José",
    responsavel: "Pe. Antônio Bianchi",
    endereco: "Rua Independência, 420",
    bairro: "Centro",
    cidade: "São Leopoldo",
    horario: "Seg a Sex, 8h às 17h",
    pecas: ["Casacos", "Cobertores", "Roupas infantis"],
  },
  {
    id: 2,
    nome: "Mercado Solidário Bom Preço",
    responsavel: "Marina Schmitt",
    endereco: "Av. Pedro Adams Filho, 1500",
    bairro: "Vila Rosa",
    cidade: "Novo Hamburgo",
    horario: "Seg a Sáb, 9h às 19h",
    pecas: ["Blusas de frio", "Calças", "Calçados"],
  },
  {
    id: 3,
    nome: "Centro Comunitário Esperança",
    responsavel: "João Pereira",
    endereco: "Rua Os Dezoito do Forte, 230",
    bairro: "São Pelegrino",
    cidade: "Caxias do Sul",
    horario: "Seg a Sex, 13h às 18h",
    pecas: ["Casacos", "Cobertores", "Cachecóis e toucas", "Meias e luvas"],
  },
  {
    id: 4,
    nome: "Farmácia Vida Plena",
    responsavel: "Cláudia Oliveira",
    endereco: "Av. Ipiranga, 3000",
    bairro: "Partenon",
    cidade: "Porto Alegre",
    horario: "Todos os dias, 8h às 22h",
    pecas: ["Blusas de frio", "Cachecóis e toucas", "Meias e luvas"],
  },
  {
    id: 5,
    nome: "Escola Municipal Frei Pacífico",
    responsavel: "Diretora Helena Costa",
    endereco: "Rua Brasil, 88",
    bairro: "Rio Branco",
    cidade: "São Leopoldo",
    horario: "Seg a Sex, 7h30 às 16h30",
    pecas: ["Roupas infantis", "Casacos", "Calçados"],
  },
  {
    id: 6,
    nome: "Padaria Pão Quente",
    responsavel: "Roberto Lima",
    endereco: "Rua General Osório, 745",
    bairro: "Centro",
    cidade: "Novo Hamburgo",
    horario: "Seg a Sáb, 6h às 20h",
    pecas: ["Blusas de frio", "Cobertores"],
  },
  {
    id: 7,
    nome: "Academia Movimento",
    responsavel: "Patrícia Fontes",
    endereco: "Av. Júlio de Castilhos, 2100",
    bairro: "Lourdes",
    cidade: "Caxias do Sul",
    horario: "Seg a Sex, 6h às 23h",
    pecas: ["Casacos", "Calças", "Meias e luvas"],
  },
  {
    id: 8,
    nome: "Loja Bem Estar",
    responsavel: "Fernando Souza",
    endereco: "Rua dos Andradas, 1234",
    bairro: "Centro Histórico",
    cidade: "Porto Alegre",
    horario: "Seg a Sex, 9h às 18h",
    pecas: ["Casacos", "Blusas de frio", "Calçados", "Cachecóis e toucas"],
  },
];

/* Doações fictícias usadas na primeira execução. Algumas trazem itens
   que o ponto não precisa (excedente), para ilustrar a redistribuição. */
const DOACOES_INICIAIS = [
  {
    id: 1,
    data: "26/05/2026 09:15",
    nome: "Maria Oliveira",
    contato: "maria.oliveira@email.com",
    pontoId: 1,
    pontoNome: "Paróquia São José (São Leopoldo)",
    pecas: ["Casacos", "Cobertores"],
    quantidade: 5,
    observacoes: "Peças lavadas e dobradas.",
  },
  {
    id: 2,
    data: "27/05/2026 16:40",
    nome: "João Pereira",
    contato: "(51) 99876-1234",
    pontoId: 1,
    pontoNome: "Paróquia São José (São Leopoldo)",
    pecas: ["Roupas infantis", "Calçados"],
    quantidade: 4,
    observacoes: "",
  },
  {
    id: 3,
    data: "28/05/2026 11:05",
    nome: "Ana Souza",
    contato: "ana.souza@email.com",
    pontoId: 2,
    pontoNome: "Mercado Solidário Bom Preço (Novo Hamburgo)",
    pecas: ["Blusas de frio", "Calças"],
    quantidade: 6,
    observacoes: "Tamanhos variados.",
  },
  {
    id: 4,
    data: "29/05/2026 14:20",
    nome: "Carlos Lima",
    contato: "(54) 99123-4567",
    pontoId: 3,
    pontoNome: "Centro Comunitário Esperança (Caxias do Sul)",
    pecas: ["Cobertores", "Meias e luvas"],
    quantidade: 3,
    observacoes: "",
  },
  {
    id: 5,
    data: "30/05/2026 10:50",
    nome: "Fernanda Costa",
    contato: "fernanda.costa@email.com",
    pontoId: 4,
    pontoNome: "Farmácia Vida Plena (Porto Alegre)",
    pecas: ["Cachecóis e toucas", "Casacos"],
    quantidade: 8,
    observacoes: "Doação da campanha do prédio.",
  },
  {
    id: 6,
    data: "31/05/2026 18:30",
    nome: "Roberto Alves",
    contato: "(51) 98765-4321",
    pontoId: 6,
    pontoNome: "Padaria Pão Quente (Novo Hamburgo)",
    pecas: ["Cobertores", "Roupas infantis"],
    quantidade: 2,
    observacoes: "",
  },
  {
    id: 7,
    data: "01/06/2026 13:10",
    nome: "Patrícia Gomes",
    contato: "patricia.gomes@email.com",
    pontoId: 8,
    pontoNome: "Loja Bem Estar (Porto Alegre)",
    pecas: ["Calçados", "Blusas de frio"],
    quantidade: 7,
    observacoes: "Calçados em bom estado.",
  },
  {
    id: 8,
    data: "27/05/2026 08:50",
    nome: "Lucas Martins",
    contato: "lucas.martins@email.com",
    pontoId: 5,
    pontoNome: "Escola Municipal Frei Pacífico (São Leopoldo)",
    pecas: ["Roupas infantis", "Casacos"],
    quantidade: 5,
    observacoes: "Roupas de criança de 4 a 8 anos.",
  },
  {
    id: 9,
    data: "28/05/2026 17:25",
    nome: "Juliana Reis",
    contato: "(51) 99432-8810",
    pontoId: 5,
    pontoNome: "Escola Municipal Frei Pacífico (São Leopoldo)",
    pecas: ["Cobertores"],
    quantidade: 3,
    observacoes: "",
  },
  {
    id: 10,
    data: "29/05/2026 09:40",
    nome: "Marcos Vieira",
    contato: "marcos.vieira@email.com",
    pontoId: 7,
    pontoNome: "Academia Movimento (Caxias do Sul)",
    pecas: ["Calças", "Meias e luvas"],
    quantidade: 4,
    observacoes: "",
  },
  {
    id: 11,
    data: "30/05/2026 19:05",
    nome: "Beatriz Nunes",
    contato: "(54) 99777-2031",
    pontoId: 7,
    pontoNome: "Academia Movimento (Caxias do Sul)",
    pecas: ["Blusas de frio"],
    quantidade: 6,
    observacoes: "Blusas de moletom novas.",
  },
  {
    id: 12,
    data: "31/05/2026 12:15",
    nome: "Rafael Carvalho",
    contato: "rafael.carvalho@email.com",
    pontoId: 3,
    pontoNome: "Centro Comunitário Esperança (Caxias do Sul)",
    pecas: ["Cachecóis e toucas", "Casacos"],
    quantidade: 5,
    observacoes: "",
  },
  {
    id: 13,
    data: "01/06/2026 15:50",
    nome: "Camila Ferreira",
    contato: "camila.ferreira@email.com",
    pontoId: 2,
    pontoNome: "Mercado Solidário Bom Preço (Novo Hamburgo)",
    pecas: ["Calçados", "Cobertores"],
    quantidade: 4,
    observacoes: "Cobertores de casal.",
  },
];

/* Patrocinadores/apoiadores fictícios usados na primeira execução. */
const PATROCINADORES_INICIAIS = [
  {
    id: 1,
    data: "20/05/2026 10:00",
    nome: "Malhas Serra",
    aprovado: false,
    responsavel: "Sandra Boff",
    contato: "contato@malhasserra.com.br",
    site: "https://www.malhasserra.com.br",
    nivel: "Patrocinador",
    mensagem: "Vamos doar malhas novas a cada campanha de inverno.",
  },
  {
    id: 2,
    data: "22/05/2026 15:30",
    nome: "Rádio Comunitária Vale",
    aprovado: false,
    responsavel: "Pedro Antunes",
    contato: "(51) 99555-0102",
    site: "",
    nivel: "Apoiador",
    mensagem: "Divulgaremos a campanha na nossa programação.",
  },
  {
    id: 3,
    data: "24/05/2026 09:45",
    nome: "Gráfica Imprime Bem",
    aprovado: false,
    responsavel: "Letícia Martins",
    contato: "contato@imprimebem.com.br",
    site: "",
    nivel: "Apoiador",
    mensagem: "",
  },
];

/* ---------- Funções de PONTOS ---------- */

/* Retorna a lista de pontos do localStorage.
   Na primeira vez, grava os pontos iniciais. */
function obterPontos() {
  const bruto = localStorage.getItem(CHAVE_PONTOS);
  if (bruto === null) {
    localStorage.setItem(CHAVE_PONTOS, JSON.stringify(PONTOS_INICIAIS));
    return [...PONTOS_INICIAIS];
  }
  try {
    return JSON.parse(bruto);
  } catch (e) {
    // Se os dados estiverem corrompidos, restaura os iniciais
    localStorage.setItem(CHAVE_PONTOS, JSON.stringify(PONTOS_INICIAIS));
    return [...PONTOS_INICIAIS];
  }
}

/* Salva um novo ponto e devolve o ponto criado (com id gerado) */
function salvarPonto(ponto) {
  const pontos = obterPontos();
  const novoId = pontos.length ? Math.max(...pontos.map((p) => p.id)) + 1 : 1;
  const novoPonto = { id: novoId, ...ponto };
  pontos.push(novoPonto);
  localStorage.setItem(CHAVE_PONTOS, JSON.stringify(pontos));
  return novoPonto;
}

/* Remove um ponto pelo id */
function removerPonto(id) {
  const pontos = obterPontos().filter((p) => p.id !== Number(id));
  localStorage.setItem(CHAVE_PONTOS, JSON.stringify(pontos));
}

/* Atualiza os itens que um ponto precisa no momento (manutenção do ponto).
   Recebe a lista de peças marcadas como "preciso agora". */
function atualizarPecasPonto(id, pecas) {
  const pontos = obterPontos().map((p) =>
    p.id === Number(id) ? { ...p, pecas: pecas } : p
  );
  localStorage.setItem(CHAVE_PONTOS, JSON.stringify(pontos));
}

/* ---------- Funções de DOAÇÕES ---------- */

/* Retorna a lista de doações registradas.
   Na primeira vez, grava as doações de exemplo. */
function obterDoacoes() {
  const bruto = localStorage.getItem(CHAVE_DOACOES);
  if (bruto === null) {
    localStorage.setItem(CHAVE_DOACOES, JSON.stringify(DOACOES_INICIAIS));
    return [...DOACOES_INICIAIS];
  }
  try {
    return JSON.parse(bruto);
  } catch (e) {
    return [];
  }
}

/* Salva uma nova doação e devolve a doação criada */
function salvarDoacao(doacao) {
  const doacoes = obterDoacoes();
  const novoId = doacoes.length ? Math.max(...doacoes.map((d) => d.id)) + 1 : 1;
  const novaDoacao = {
    id: novoId,
    data: new Date().toLocaleString("pt-BR"),
    ...doacao,
  };
  doacoes.push(novaDoacao);
  localStorage.setItem(CHAVE_DOACOES, JSON.stringify(doacoes));
  return novaDoacao;
}

/* Remove uma doação pelo id */
function removerDoacao(id) {
  const doacoes = obterDoacoes().filter((d) => d.id !== Number(id));
  localStorage.setItem(CHAVE_DOACOES, JSON.stringify(doacoes));
}

/* ---------- Estoque e redistribuição ----------
   Regra do projeto: todo ponto ACEITA qualquer peça, mas cada um
   PRECISA de itens específicos (ponto.pecas). O doador entrega tudo
   num único ponto; o que aquele ponto não precisa é "excedente" e
   deve ser encaminhado a outro ponto que precise daquele item. */

/* Calcula, para cada ponto, o que ele recebeu em doações.
   Retorna: [{ ponto, itens: [{ peca, quantidade, precisa }], totalPecas }]
   - quantidade = nº de doações que trouxeram aquela peça
   - precisa = true se o ponto precisa daquela peça (senão é excedente) */
function calcularEstoque() {
  const pontos = obterPontos();
  const doacoes = obterDoacoes();

  return pontos.map((ponto) => {
    const contagem = {}; // peca -> nº de doações
    let totalPecas = 0; // soma das quantidades das doações desse ponto

    doacoes
      .filter((d) => d.pontoId === ponto.id)
      .forEach((d) => {
        totalPecas += Number(d.quantidade) || 0;
        d.pecas.forEach((peca) => {
          contagem[peca] = (contagem[peca] || 0) + 1;
        });
      });

    const itens = Object.keys(contagem)
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((peca) => ({
        peca: peca,
        quantidade: contagem[peca],
        precisa: ponto.pecas.includes(peca),
      }));

    return { ponto: ponto, itens: itens, totalPecas: totalPecas };
  });
}

/* Lista os itens excedentes (recebidos por um ponto que não precisa deles)
   e sugere para quais pontos encaminhar — os que precisam daquele item.
   Retorna: [{ peca, origem: ponto, quantidade, destinos: [pontos] }] */
function calcularRedistribuicoes() {
  const pontos = obterPontos();
  const lista = [];

  calcularEstoque().forEach(({ ponto, itens }) => {
    itens
      .filter((item) => !item.precisa) // sobra: o ponto não precisa
      .forEach((item) => {
        const destinos = pontos.filter(
          (p) => p.id !== ponto.id && p.pecas.includes(item.peca)
        );
        lista.push({
          peca: item.peca,
          origem: ponto,
          quantidade: item.quantidade,
          destinos: destinos,
        });
      });
  });

  return lista;
}

/* ---------- Funções de PATROCINADORES / APOIADORES ----------
   Empresas/organizações que apoiam o projeto. Cada registro tem
   um "nivel": "Patrocinador" ou "Apoiador". Os cadastrados aparecem
   no mural da página inicial e na lista do painel. */

/* Retorna a lista de patrocinadores/apoiadores registrados.
   Na primeira vez, grava os patrocinadores de exemplo. */
function obterPatrocinadores() {
  const bruto = localStorage.getItem(CHAVE_PATROCINADORES);
  if (bruto === null) {
    localStorage.setItem(CHAVE_PATROCINADORES, JSON.stringify(PATROCINADORES_INICIAIS));
    return [...PATROCINADORES_INICIAIS];
  }
  try {
    return JSON.parse(bruto);
  } catch (e) {
    return [];
  }
}

/* Salva um novo patrocinador e devolve o registro criado (com id e data) */
function salvarPatrocinador(patrocinador) {
  const lista = obterPatrocinadores();
  const novoId = lista.length ? Math.max(...lista.map((p) => p.id)) + 1 : 1;
  const novo = {
    id: novoId,
    data: new Date().toLocaleString("pt-BR"),
    ...patrocinador,
    aprovado: false, // novos cadastros aguardam aprovação no painel
  };
  lista.push(novo);
  localStorage.setItem(CHAVE_PATROCINADORES, JSON.stringify(lista));
  return novo;
}

/* Remove um patrocinador pelo id */
function removerPatrocinador(id) {
  const lista = obterPatrocinadores().filter((p) => p.id !== Number(id));
  localStorage.setItem(CHAVE_PATROCINADORES, JSON.stringify(lista));
}

/* Aprova um patrocinador — a partir daí ele aparece na página inicial */
function aprovarPatrocinador(id) {
  const lista = obterPatrocinadores().map((p) =>
    p.id === Number(id) ? { ...p, aprovado: true } : p
  );
  localStorage.setItem(CHAVE_PATROCINADORES, JSON.stringify(lista));
}

/* Retorna apenas os patrocinadores/apoiadores já aprovados */
function obterPatrocinadoresAprovados() {
  return obterPatrocinadores().filter((p) => p.aprovado);
}
