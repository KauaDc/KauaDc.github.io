/* =========================================================
   Armário Social — Menu responsivo (hambúrguer)
   Abre e fecha o menu de navegação em telas pequenas.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const botao = document.querySelector(".menu-toggle");
  const navegacao = document.querySelector(".navegacao");

  if (!botao || !navegacao) return;

  botao.addEventListener("click", function () {
    const aberto = navegacao.classList.toggle("aberto");
    botao.setAttribute("aria-expanded", aberto ? "true" : "false");
  });
});
