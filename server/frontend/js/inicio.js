/* =========================================================
   Armário Social — Página inicial
   Ajusta o botão de Parceiro conforme o estado de login:
   - Deslogado: "Entrar como Parceiro" (vai para o login).
   - Logado:    "Sair (usuário)" — encerra a sessão.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const botao = document.getElementById("btn-parceiro");
  if (!botao) return;

  if (estaLogado()) {
    const parceiro = parceiroAtual();
    botao.textContent = parceiro && parceiro.usuario
      ? `Sair (${parceiro.usuario})`
      : "Sair";
    botao.href = "#";
    botao.addEventListener("click", function (evento) {
      evento.preventDefault();
      logout();
      window.location.reload();
    });
  } else {
    botao.textContent = "Entrar como Parceiro";
    botao.href = "login.html";
  }
});
