/* =========================================================
   Armário Social — Sessão do Parceiro (front-end)
   Guarda o token de login no sessionStorage (some ao fechar a
   aba) e oferece funções auxiliares usadas por dados.js, login.js
   e painel.js. Deve ser carregado ANTES de dados.js.
   ========================================================= */
const CHAVE_SESSAO = "armario_social_sessao";

/* Salva a sessão retornada pelo login: { token, usuario, nome }. */
function salvarSessao(sessao) {
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

/* Lê a sessão guardada (ou null). */
function obterSessaoLocal() {
  const bruto = sessionStorage.getItem(CHAVE_SESSAO);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto);
  } catch (e) {
    return null;
  }
}

/* Token atual (ou null). Usado por dados.js para autenticar requisições. */
function obterToken() {
  const sessao = obterSessaoLocal();
  return sessao ? sessao.token : null;
}

/* Há um parceiro logado? (presença de token; a validade real é checada no servidor) */
function estaLogado() {
  return !!obterToken();
}

/* Dados do usuário logado (usuario, nome, role) ou null. */
function parceiroAtual() {
  const sessao = obterSessaoLocal();
  return sessao
    ? { usuario: sessao.usuario, nome: sessao.nome, role: sessao.role }
    : null;
}

/* O usuário logado é administrador? */
function ehAdmin() {
  const sessao = obterSessaoLocal();
  return !!sessao && sessao.role === "admin";
}

/* Encerra a sessão local. */
function logout() {
  sessionStorage.removeItem(CHAVE_SESSAO);
}
