/* =========================================================
   Armário Social — Página "Quero doar"
   - Gera os tipos de peça em checkboxes
   - Mostra os pontos de coleta como cards (todo ponto aceita qualquer peça;
     as tags mostram o que cada um precisa)
   - Ao marcar peças, ordena os pontos por quem mais precisa delas e indica
     no card o que fica e o que será encaminhado a outro ponto
   - Filtro por cidade; o ponto é escolhido clicando no card
   - A doação é salva no localStorage
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-doacao");
  const grupoPecas = document.getElementById("grupo-pecas");
  const listaPontosEl = document.getElementById("lista-pontos");
  const semPontosEl = document.getElementById("sem-pontos");
  const ajudaPontosEl = document.getElementById("ajuda-pontos");
  const filtroCidadeEl = document.getElementById("filtro-cidade");
  const inputPonto = document.getElementById("ponto"); // hidden: guarda o id escolhido

  let pontoSelecionadoId = null;

  /* Retorna a lista de peças marcadas no formulário */
  function pecasSelecionadas() {
    return Array.from(
      form.querySelectorAll('input[name="pecas"]:checked')
    ).map((c) => c.value);
  }

  /* Gera os checkboxes de tipos de peça */
  function carregarPecas() {
    TIPOS_DE_PECA.forEach((peca, indice) => {
      const id = `peca-${indice}`;
      const label = document.createElement("label");
      label.setAttribute("for", id);
      label.innerHTML = `<input type="checkbox" id="${id}" name="pecas" value="${peca}" /> ${peca}`;
      grupoPecas.appendChild(label);
    });

    // Sempre que uma peça muda, refaz a lista de pontos
    grupoPecas.addEventListener("change", function () {
      renderizarPontos();
    });
  }

  /* Preenche o seletor de cidades com as cidades dos pontos (sem repetir) */
  function carregarCidades() {
    const cidades = [...new Set(obterPontos().map((p) => p.cidade))].sort(
      (a, b) => a.localeCompare(b, "pt-BR")
    );
    cidades.forEach((cidade) => {
      const opcao = document.createElement("option");
      opcao.value = cidade;
      opcao.textContent = cidade;
      filtroCidadeEl.appendChild(opcao);
    });

    // Ao trocar a cidade, refaz a lista de pontos
    filtroCidadeEl.addEventListener("change", function () {
      renderizarPontos();
    });
  }

  /* Monta o card de um ponto. Todo ponto aceita qualquer peça;
     as tags mostram o que ele PRECISA e os itens escolhidos pelo
     doador que coincidem ficam destacados. A nota explica o que
     ficará no ponto e o que será encaminhado para outro lugar. */
  function montarCard(ponto, marcadas) {
    const tags = ponto.pecas
      .map((peca) => {
        const combina = marcadas.includes(peca);
        return `<span class="tag${combina ? " tag--match" : ""}">${peca}</span>`;
      })
      .join("");

    const selecionado = ponto.id === pontoSelecionadoId;

    // Em relação às peças que o doador marcou:
    const precisa = marcadas.filter((p) => ponto.pecas.includes(p));
    const excedente = marcadas.filter((p) => !ponto.pecas.includes(p));

    let nota = "";
    if (marcadas.length > 0) {
      const linhas = [];
      if (precisa.length > 0) {
        linhas.push(
          `<p class="card__nota card__nota--ok">✓ Fica aqui (precisa de): ${precisa.join(", ")}.</p>`
        );
      }
      if (excedente.length > 0) {
        linhas.push(
          `<p class="card__nota">↪ ${excedente.join(", ")} será encaminhado a outros pontos que precisam.</p>`
        );
      }
      nota = linhas.join("");
    }

    return `
      <article class="card card--selecionavel${selecionado ? " card--selecionado" : ""}"
               role="button" tabindex="0"
               aria-pressed="${selecionado}" data-id="${ponto.id}">
        <div class="card__selecao">${selecionado ? "✓ Selecionado" : "Escolher"}</div>
        <h2 class="card__titulo">${ponto.nome}</h2>
        <p class="card__info">📍 <span><strong>${ponto.endereco}</strong>, ${ponto.bairro}, ${ponto.cidade}</span></p>
        <p class="card__info">🕒 <span>${ponto.horario}</span></p>
        <p class="card__info">👤 <span>${ponto.responsavel}</span></p>
        ${
          ponto.pecas.length
            ? `<div>
          <p class="card__info" style="margin-bottom:0.25rem;">Precisa de (aceita qualquer peça):</p>
          <div class="tags">${tags}</div>
        </div>`
            : `<p class="card__info">Sem itens prioritários agora — aceita qualquer peça.</p>`
        }
        ${nota}
      </article>
    `;
  }

  /* Renderiza os pontos. Todo ponto aceita tudo, então a lista mostra
     TODOS (apenas filtrada por cidade). Quando há itens marcados, os
     pontos são ordenados por quem mais precisa dos itens escolhidos. */
  function renderizarPontos() {
    const pontos = obterPontos();
    const marcadas = pecasSelecionadas();
    const cidade = filtroCidadeEl.value;

    let filtrados = pontos;
    if (cidade) {
      filtrados = filtrados.filter((ponto) => ponto.cidade === cidade);
    }

    // Ordena: pontos que mais precisam dos itens escolhidos aparecem primeiro
    if (marcadas.length > 0) {
      filtrados = [...filtrados].sort((a, b) => {
        const na = a.pecas.filter((p) => marcadas.includes(p)).length;
        const nb = b.pecas.filter((p) => marcadas.includes(p)).length;
        return nb - na;
      });
    }

    // Se o ponto escolhido saiu da lista filtrada (por cidade), limpa a seleção
    if (
      pontoSelecionadoId !== null &&
      !filtrados.some((p) => p.id === pontoSelecionadoId)
    ) {
      pontoSelecionadoId = null;
      inputPonto.value = "";
    }

    // Texto de ajuda dinâmico
    if (marcadas.length === 0 && !cidade) {
      ajudaPontosEl.textContent =
        "Você entrega tudo num único ponto. Clique no ponto onde deseja deixar suas peças.";
    } else {
      const partes = [];
      if (marcadas.length > 0) partes.push("ordenados por quem mais precisa dos seus itens");
      if (cidade) partes.push(`em ${cidade}`);
      ajudaPontosEl.textContent = `Pontos ${partes.join(", ")}. Entregue tudo num só: o excedente é encaminhado a quem precisa.`;
    }

    // Mensagem de "nenhum ponto" x lista
    if (filtrados.length === 0) {
      listaPontosEl.innerHTML = "";
      semPontosEl.classList.remove("oculto");
      return;
    }

    semPontosEl.classList.add("oculto");
    listaPontosEl.innerHTML = filtrados
      .map((ponto) => montarCard(ponto, marcadas))
      .join("");
  }

  /* Marca um card como selecionado (e guarda o id no input oculto) */
  function selecionarPonto(id) {
    pontoSelecionadoId = Number(id);
    inputPonto.value = String(id);
    renderizarPontos();
  }

  /* Clique nos cards (delegação de evento) */
  listaPontosEl.addEventListener("click", function (evento) {
    const card = evento.target.closest(".card--selecionavel");
    if (card) selecionarPonto(card.dataset.id);
  });

  /* Acessibilidade: permite escolher com Enter ou Espaço */
  listaPontosEl.addEventListener("keydown", function (evento) {
    if (evento.key !== "Enter" && evento.key !== " ") return;
    const card = evento.target.closest(".card--selecionavel");
    if (card) {
      evento.preventDefault();
      selecionarPonto(card.dataset.id);
    }
  });

  carregarPecas();
  carregarCidades();
  renderizarPontos();

  // Se a URL trouxer ?ponto=ID (vindo da página de pontos), já seleciona
  const params = new URLSearchParams(window.location.search);
  const pontoUrl = params.get("ponto");
  if (pontoUrl && obterPontos().some((p) => p.id === Number(pontoUrl))) {
    selecionarPonto(pontoUrl);
  }

  /* Tratamento do envio do formulário */
  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const contato = document.getElementById("contato").value.trim();
    const quantidade = document.getElementById("quantidade").value;
    const observacoes = document.getElementById("observacoes").value.trim();
    const pecasMarcadas = pecasSelecionadas();

    // Validação simples
    if (!nome || !contato || pecasMarcadas.length === 0) {
      mostrarAviso({
        tipo: "aviso",
        titulo: "Faltam informações",
        mensagem: "Preencha nome, contato e selecione ao menos um tipo de peça.",
        duracao: 0,
      });
      return;
    }
    if (pontoSelecionadoId === null) {
      mostrarAviso({
        tipo: "aviso",
        titulo: "Escolha um ponto",
        mensagem: "Selecione um ponto de coleta clicando em um dos cards.",
        duracao: 0,
      });
      listaPontosEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Recupera o ponto escolhido para guardar junto
    const ponto = obterPontos().find((p) => p.id === pontoSelecionadoId);

    // Salva a doação
    salvarDoacao({
      nome: nome,
      contato: contato,
      pontoId: pontoSelecionadoId,
      pontoNome: ponto ? `${ponto.nome} (${ponto.cidade})` : "Ponto não identificado",
      pecas: pecasMarcadas,
      quantidade: Number(quantidade),
      observacoes: observacoes,
    });

    // Limpa o formulário e confirma com o modal de aviso
    form.reset();
    pontoSelecionadoId = null;
    inputPonto.value = "";
    renderizarPontos();

    mostrarAviso({
      tipo: "sucesso",
      titulo: "Doação registrada!",
      mensagem: `Obrigado, <strong>${nome}</strong>! Leve suas peças até <strong>${ponto ? ponto.nome : "o ponto escolhido"}</strong>.`,
      duracao: 0,
    });
  });
});
