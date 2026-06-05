/* =========================================================
   Armário Social — Página de Pontos de coleta
   Renderiza os cards de pontos e aplica o filtro de busca
   por cidade ou bairro.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const listaEl = document.getElementById("lista-pontos");
  const buscaEl = document.getElementById("busca");
  const semResultadosEl = document.getElementById("sem-resultados");
  const contadorEl = document.getElementById("contador-resultados");

  /* Cria o HTML de um card de ponto */
  function montarCard(ponto) {
    const tags = ponto.pecas
      .map((peca) => `<span class="tag">${peca}</span>`)
      .join("");

    return `
      <article class="card">
        <h2 class="card__titulo">${ponto.nome}</h2>
        <p class="card__info">📍 <span><strong>${ponto.endereco}</strong>, ${ponto.bairro}, ${ponto.cidade}</span></p>
        <p class="card__info">🕒 <span>${ponto.horario}</span></p>
        <p class="card__info">👤 <span>${ponto.responsavel}</span></p>
        ${
          ponto.pecas.length
            ? `<div>
          <p class="card__info" style="margin-bottom:0.25rem;">Precisa de <em style="color:var(--cor-texto-suave);">(aceita qualquer peça)</em>:</p>
          <div class="tags">${tags}</div>
        </div>`
            : `<p class="card__info">Sem itens prioritários agora <em style="color:var(--cor-texto-suave);">(aceita qualquer peça)</em>.</p>`
        }
        <div class="card__rodape">
          <a href="doar.html?ponto=${ponto.id}" class="botao botao--destaque botao--pequeno">Doar para este ponto</a>
        </div>
      </article>
    `;
  }

  /* Renderiza a lista, aplicando o termo de busca (se houver) */
  function renderizar(termo = "") {
    const pontos = obterPontos();
    const termoLimpo = termo.trim().toLowerCase();

    const filtrados = pontos.filter((ponto) => {
      if (!termoLimpo) return true;
      return (
        ponto.cidade.toLowerCase().includes(termoLimpo) ||
        ponto.bairro.toLowerCase().includes(termoLimpo)
      );
    });

    listaEl.innerHTML = filtrados.map(montarCard).join("");

    // Controla a mensagem de "sem resultados" e o contador
    if (filtrados.length === 0) {
      semResultadosEl.classList.remove("oculto");
      contadorEl.textContent = "";
    } else {
      semResultadosEl.classList.add("oculto");
      const plural = filtrados.length > 1 ? "pontos encontrados" : "ponto encontrado";
      contadorEl.textContent = `${filtrados.length} ${plural}.`;
    }
  }

  // Renderiza tudo ao carregar a página
  renderizar();

  // Filtra em tempo real conforme o usuário digita
  buscaEl.addEventListener("input", function () {
    renderizar(buscaEl.value);
  });
});
