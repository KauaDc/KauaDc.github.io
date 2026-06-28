/* =========================================================
   Armário Social — Módulo de dados (cliente da API)
   Antes os dados ficavam no localStorage; agora são lidos e
   gravados no PostgreSQL através da API REST (backend Express).
   Cada função abaixo conversa com a API via fetch e devolve
   uma Promise — por isso os arquivos que as usam empregam
   async/await.
   ========================================================= */

/* Tipos de peças aceitas (lista fixa, usada nos formulários).
   Continua no front-end por ser uma enumeração estável. */
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

/* Endereço base da API (mesma origem que serve as páginas). */
const API = "/api";

/* Faz uma requisição à API e devolve o JSON da resposta.
   Lança um erro com mensagem amigável se a resposta não for OK,
   para que quem chama possa exibir um aviso ao usuário. */
async function apiFetch(caminho, opcoes = {}) {
  const headers = { ...(opcoes.headers || {}) };
  if (opcoes.body != null) headers["Content-Type"] = "application/json";

  // Anexa o token do parceiro logado, se houver (definido em auth.js).
  const token = typeof obterToken === "function" ? obterToken() : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${API}${caminho}`, { ...opcoes, headers });
  } catch (e) {
    // Falha de rede (servidor desligado, sem conexão, etc.)
    throw new Error(
      "Não foi possível falar com o servidor. Verifique se ele está rodando (npm start)."
    );
  }

  // Token ausente/expirado em um recurso protegido: encerra a sessão local.
  if (resposta.status === 401 && typeof logout === "function") {
    logout();
  }

  if (!resposta.ok) {
    let mensagem = "Ocorreu um erro ao processar a solicitação.";
    try {
      const corpo = await resposta.json();
      if (corpo && corpo.erro) mensagem = corpo.erro;
    } catch (e) {
      /* resposta sem JSON — mantém a mensagem padrão */
    }
    throw new Error(mensagem);
  }

  // 204 (sem conteúdo): nada a desserializar.
  if (resposta.status === 204) return null;
  return resposta.json();
}

/* ---------- Autenticação ---------- */

/* Faz login do parceiro. Devolve { token, usuario, nome }. */
function login(usuario, senha) {
  return apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({ usuario: usuario, senha: senha }),
  });
}

/* Confirma a sessão atual no servidor (GET /api/me). Lança erro se o token
   estiver ausente, inválido ou expirado. */
function obterSessao() {
  return apiFetch("/me");
}

/* ---------- Funções de PONTOS ---------- */

/* Retorna a lista de pontos de coleta. */
function obterPontos() {
  return apiFetch("/pontos");
}

/* Cria um novo ponto e devolve o ponto criado (com id gerado). */
function salvarPonto(ponto) {
  return apiFetch("/pontos", { method: "POST", body: JSON.stringify(ponto) });
}

/* Remove um ponto pelo id. */
function removerPonto(id) {
  return apiFetch(`/pontos/${id}`, { method: "DELETE" });
}

/* Atualiza os itens que um ponto precisa no momento. */
function atualizarPecasPonto(id, pecas) {
  return apiFetch(`/pontos/${id}/pecas`, {
    method: "PATCH",
    body: JSON.stringify({ pecas: pecas }),
  });
}

/* ---------- Funções de DOAÇÕES ---------- */

/* Retorna a lista de doações registradas. */
function obterDoacoes() {
  return apiFetch("/doacoes");
}

/* Registra uma nova doação e devolve a doação criada. */
function salvarDoacao(doacao) {
  return apiFetch("/doacoes", { method: "POST", body: JSON.stringify(doacao) });
}

/* Remove uma doação pelo id. */
function removerDoacao(id) {
  return apiFetch(`/doacoes/${id}`, { method: "DELETE" });
}

/* ---------- Estoque e redistribuição (calculados no servidor) ----------
   O cálculo foi movido para o backend para que o usuário comum veja os
   agregados (o que cada ponto recebeu, o que sobra e para onde encaminhar)
   sem receber as doações cruas, que contêm dados pessoais dos doadores. */

/* Estoque por ponto: [{ ponto, itens: [{ peca, quantidade, precisa }], totalPecas }] */
function obterEstoque() {
  return apiFetch("/estoque");
}

/* Encaminhamentos sugeridos: [{ peca, origem, quantidade, destinos }] */
function obterRedistribuicoes() {
  return apiFetch("/redistribuicoes");
}

/* ---------- Funções de PATROCINADORES / APOIADORES ---------- */

/* Retorna todos os patrocinadores/apoiadores registrados. */
function obterPatrocinadores() {
  return apiFetch("/patrocinadores");
}

/* Cadastra um novo patrocinador e devolve o registro criado. */
function salvarPatrocinador(patrocinador) {
  return apiFetch("/patrocinadores", {
    method: "POST",
    body: JSON.stringify(patrocinador),
  });
}

/* Remove um patrocinador pelo id. */
function removerPatrocinador(id) {
  return apiFetch(`/patrocinadores/${id}`, { method: "DELETE" });
}

/* Aprova um patrocinador — a partir daí ele aparece na página inicial. */
function aprovarPatrocinador(id) {
  return apiFetch(`/patrocinadores/${id}/aprovar`, { method: "PATCH" });
}

/* Retorna apenas os patrocinadores/apoiadores já aprovados (rota pública). */
function obterPatrocinadoresAprovados() {
  return apiFetch("/patrocinadores/aprovados");
}

/* ---------- Contas de PARCEIRO (somente admin) ---------- */

/* Lista as contas de parceiro (sem a senha). */
function obterParceiros() {
  return apiFetch("/parceiros");
}

/* Cria uma conta de parceiro: { usuario, senha, nome }. */
function criarParceiro(conta) {
  return apiFetch("/parceiros", { method: "POST", body: JSON.stringify(conta) });
}

/* Remove uma conta de parceiro pelo id. */
function removerParceiro(id) {
  return apiFetch(`/parceiros/${id}`, { method: "DELETE" });
}
