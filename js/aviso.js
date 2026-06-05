/* =========================================================
   Armário Social — Sistema de avisos (modal) reutilizável
   Uso:
     mostrarAviso({ titulo, mensagem, tipo, duracao });
       tipo: "sucesso" (padrão) | "info" | "aviso"
       duracao: ms até fechar sozinho (0 = só fecha no clique/Esc)
   ========================================================= */
(function () {
  let overlay, dialog, iconeEl, tituloEl, mensagemEl, botaoEl, timer, ultimoFoco;

  /* Ícones (SVG branco sobre o badge colorido) */
  const ICONES = {
    sucesso:
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    info:
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
    aviso:
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20z"/><path d="M12 10v4"/><path d="M12 17h.01"/></svg>',
  };

  /* Cria o modal uma única vez e o reaproveita */
  function construir() {
    overlay = document.createElement("div");
    overlay.className = "aviso-overlay";
    overlay.setAttribute("hidden", "");
    overlay.innerHTML =
      '<div class="aviso" role="dialog" aria-modal="true" aria-labelledby="aviso-titulo" aria-describedby="aviso-mensagem">' +
      '<div class="aviso__icone" aria-hidden="true"></div>' +
      '<h3 class="aviso__titulo" id="aviso-titulo"></h3>' +
      '<p class="aviso__mensagem" id="aviso-mensagem"></p>' +
      '<button type="button" class="botao botao--destaque aviso__ok">Ok, entendi</button>' +
      "</div>";
    document.body.appendChild(overlay);

    dialog = overlay.querySelector(".aviso");
    iconeEl = overlay.querySelector(".aviso__icone");
    tituloEl = overlay.querySelector(".aviso__titulo");
    mensagemEl = overlay.querySelector(".aviso__mensagem");
    botaoEl = overlay.querySelector(".aviso__ok");

    botaoEl.addEventListener("click", fecharAviso);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) fecharAviso();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hasAttribute("hidden")) fecharAviso();
    });
  }

  function mostrarAviso(opcoes) {
    const o = opcoes || {};
    if (!overlay) construir();

    const tipo = o.tipo || "sucesso";
    dialog.className = "aviso aviso--" + tipo;
    iconeEl.innerHTML = ICONES[tipo] || ICONES.sucesso;
    tituloEl.textContent = o.titulo || "Tudo certo!";
    mensagemEl.innerHTML = o.mensagem || "";

    ultimoFoco = document.activeElement;
    overlay.removeAttribute("hidden");
    void overlay.offsetWidth; // força reflow para a animação de entrada
    overlay.classList.add("aviso-overlay--ativo");
    botaoEl.focus();

    clearTimeout(timer);
    const duracao = o.duracao != null ? o.duracao : 3500;
    if (duracao > 0) timer = setTimeout(fecharAviso, duracao);
  }

  function fecharAviso() {
    if (!overlay || overlay.hasAttribute("hidden")) return;
    clearTimeout(timer);
    overlay.classList.remove("aviso-overlay--ativo");
    setTimeout(function () {
      overlay.setAttribute("hidden", "");
      if (ultimoFoco && typeof ultimoFoco.focus === "function") ultimoFoco.focus();
    }, 250); // acompanha a transição definida no CSS
  }

  window.mostrarAviso = mostrarAviso;
  window.fecharAviso = fecharAviso;
})();
