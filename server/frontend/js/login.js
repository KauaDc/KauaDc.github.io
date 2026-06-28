/* =========================================================
   Armário Social — Tela de login do Parceiro
   Valida usuário/senha na API, guarda a sessão e leva ao painel.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-login");

  // Já logado? Vai direto para o painel.
  if (estaLogado()) {
    window.location.href = "painel.html";
    return;
  }

  form.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value;

    if (!usuario || !senha) {
      mostrarAviso({
        tipo: "aviso",
        titulo: "Faltam informações",
        mensagem: "Informe usuário e senha.",
        duracao: 0,
      });
      return;
    }

    try {
      const sessao = await login(usuario, senha);
      salvarSessao(sessao);
    } catch (erro) {
      mostrarAviso({
        tipo: "aviso",
        titulo: "Não foi possível entrar",
        mensagem: erro.message,
        duracao: 0,
      });
      return;
    }

    // Sucesso: vai para o painel com acesso de parceiro.
    window.location.href = "painel.html";
  });
});
