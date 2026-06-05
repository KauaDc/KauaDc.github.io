/* =========================================================
   Armário Social — Painel do administrador
   Lista doações e pontos do localStorage e permite removê-los.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const listaDoacoesEl = document.getElementById("lista-doacoes");
  const listaPontosEl = document.getElementById("lista-pontos-painel");
  const listaEstoqueEl = document.getElementById("lista-estoque");
  const listaRedistEl = document.getElementById("lista-redist");
  const listaPatrocinadoresEl = document.getElementById("lista-patrocinadores");
  const semDoacoesEl = document.getElementById("sem-doacoes");
  const semPontosEl = document.getElementById("sem-pontos");
  const semEstoqueEl = document.getElementById("sem-estoque");
  const semRedistEl = document.getElementById("sem-redist");
  const semPatrocinadoresEl = document.getElementById("sem-patrocinadores");
  const totalDoacoesEl = document.getElementById("total-doacoes");
  const totalPontosEl = document.getElementById("total-pontos");
  const totalRedistEl = document.getElementById("total-redist");
  const totalPatrocinadoresEl = document.getElementById("total-patrocinadores");

  /* Renderiza a lista de doações */
  function renderizarDoacoes() {
    const doacoes = obterDoacoes();
    totalDoacoesEl.textContent = doacoes.length;

    if (doacoes.length === 0) {
      listaDoacoesEl.innerHTML = "";
      semDoacoesEl.classList.remove("oculto");
      return;
    }

    semDoacoesEl.classList.add("oculto");
    listaDoacoesEl.innerHTML = doacoes
      .map(function (d) {
        const pecas = d.pecas.join(", ");
        const obs = d.observacoes
          ? `<p><strong>Obs.:</strong> ${d.observacoes}</p>`
          : "";
        return `
          <div class="item-painel">
            <div class="item-painel__dados">
              <h3>${d.nome} <span style="font-weight:400;color:var(--cor-texto-suave);font-size:0.9rem;">em ${d.data}</span></h3>
              <p><strong>Contato:</strong> ${d.contato}</p>
              <p><strong>Ponto:</strong> ${d.pontoNome}</p>
              <p><strong>Peças (${d.quantidade}):</strong> ${pecas}</p>
              ${obs}
            </div>
            <button class="botao botao--perigo botao--pequeno" data-tipo="doacao" data-id="${d.id}">Remover</button>
          </div>
        `;
      })
      .join("");
  }

  /* Renderiza o estoque de cada ponto (só pontos que receberam algo) */
  function renderizarEstoque() {
    const estoque = calcularEstoque().filter((e) => e.itens.length > 0);

    if (estoque.length === 0) {
      listaEstoqueEl.innerHTML = "";
      semEstoqueEl.classList.remove("oculto");
      return;
    }

    semEstoqueEl.classList.add("oculto");
    listaEstoqueEl.innerHTML = estoque
      .map(function ({ ponto, itens, totalPecas }) {
        const tags = itens
          .map(function (it) {
            const classe = it.precisa ? "tag" : "tag tag--excedente";
            const rotulo = it.precisa ? "" : " · excedente";
            return `<span class="${classe}">${it.peca} (${it.quantidade})${rotulo}</span>`;
          })
          .join("");
        return `
          <div class="item-painel">
            <div class="item-painel__dados">
              <h3>${ponto.nome} <span style="font-weight:400;color:var(--cor-texto-suave);font-size:0.9rem;">(${ponto.cidade})</span></h3>
              <p><strong>Total recebido:</strong> ~${totalPecas} peça(s)</p>
              <div class="tags">${tags}</div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  /* Renderiza os encaminhamentos sugeridos (itens excedentes -> destinos) */
  function renderizarRedistribuicao() {
    const lista = calcularRedistribuicoes();
    totalRedistEl.textContent = lista.length;

    if (lista.length === 0) {
      listaRedistEl.innerHTML = "";
      semRedistEl.classList.remove("oculto");
      return;
    }

    semRedistEl.classList.add("oculto");
    listaRedistEl.innerHTML = lista
      .map(function (r) {
        const destinos = r.destinos.length
          ? r.destinos
              .map((d) => `<span class="tag">${d.nome} (${d.cidade})</span>`)
              .join("")
          : `<span class="tag tag--excedente">Nenhum ponto precisa deste item agora</span>`;
        return `
          <div class="item-painel">
            <div class="item-painel__dados">
              <h3>${r.peca} <span style="font-weight:400;color:var(--cor-texto-suave);font-size:0.9rem;">(${r.quantidade} doação(ões))</span></h3>
              <p><strong>Está em:</strong> ${r.origem.nome} (${r.origem.cidade})</p>
              <p style="margin-bottom:0.35rem;"><strong>Encaminhar para:</strong></p>
              <div class="tags">${destinos}</div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  /* Renderiza a lista de patrocinadores e apoiadores */
  function renderizarPatrocinadores() {
    const lista = obterPatrocinadores();
    totalPatrocinadoresEl.textContent = lista.length;

    if (lista.length === 0) {
      listaPatrocinadoresEl.innerHTML = "";
      semPatrocinadoresEl.classList.remove("oculto");
      return;
    }

    semPatrocinadoresEl.classList.add("oculto");

    // Pendentes (aguardando aprovação) aparecem primeiro
    const ordenada = [...lista].sort(function (a, b) {
      if (!!a.aprovado === !!b.aprovado) return 0;
      return a.aprovado ? 1 : -1;
    });

    listaPatrocinadoresEl.innerHTML = ordenada
      .map(function (p) {
        const site = p.site
          ? `<p><strong>Site:</strong> <a href="${p.site}" target="_blank" rel="noopener">${p.site}</a></p>`
          : "";
        const msg = p.mensagem
          ? `<p><strong>Mensagem:</strong> ${p.mensagem}</p>`
          : "";

        const status = p.aprovado
          ? `<span class="status status--aprovado">Aprovado</span>`
          : `<span class="status status--pendente">Aguardando aprovação</span>`;

        const botaoAprovar = p.aprovado
          ? ""
          : `<button class="botao botao--secundario botao--pequeno" data-acao="aprovar-patrocinador" data-id="${p.id}">Aprovar</button>`;

        return `
          <div class="item-painel">
            <div class="item-painel__dados">
              <h3>${p.nome} <span style="font-weight:400;color:var(--cor-texto-suave);font-size:0.9rem;">(${p.nivel})</span> ${status}</h3>
              <p><strong>Responsável:</strong> ${p.responsavel}</p>
              <p><strong>Contato:</strong> ${p.contato}</p>
              ${site}
              ${msg}
            </div>
            <div class="item-painel__acoes">
              ${botaoAprovar}
              <button class="botao botao--perigo botao--pequeno" data-tipo="patrocinador" data-id="${p.id}">Remover</button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  /* Renderiza a lista de pontos */
  function renderizarPontos() {
    const pontos = obterPontos();
    totalPontosEl.textContent = pontos.length;

    if (pontos.length === 0) {
      listaPontosEl.innerHTML = "";
      semPontosEl.classList.remove("oculto");
      return;
    }

    semPontosEl.classList.add("oculto");
    listaPontosEl.innerHTML = pontos
      .map(function (p) {
        // Texto do "Precisa de" (trata o caso de não precisar de nada agora)
        const precisaTexto = p.pecas.length
          ? `${p.pecas.join(", ")} <em style="color:var(--cor-texto-suave);">(aceita qualquer peça)</em>`
          : `<em style="color:var(--cor-texto-suave);">nada no momento — aceita qualquer peça</em>`;

        // Checkboxes de manutenção: marcado = precisa agora
        const checks = TIPOS_DE_PECA.map(function (peca, i) {
          const cid = `ponto-${p.id}-peca-${i}`;
          const marcado = p.pecas.includes(peca) ? " checked" : "";
          return `<label for="${cid}"><input type="checkbox" id="${cid}" value="${peca}"${marcado} /> ${peca}</label>`;
        }).join("");

        return `
          <div class="item-painel">
            <div class="item-painel__dados">
              <h3>${p.nome}</h3>
              <p><strong>Endereço:</strong> ${p.endereco}, ${p.bairro}, ${p.cidade}</p>
              <p><strong>Responsável:</strong> ${p.responsavel}</p>
              <p><strong>Horário:</strong> ${p.horario}</p>
              <p><strong>Precisa de:</strong> ${precisaTexto}</p>
            </div>
            <button class="botao botao--perigo botao--pequeno" data-tipo="ponto" data-id="${p.id}">Remover</button>
            <details class="gerenciar">
              <summary>Gerenciar itens necessários</summary>
              <p class="campo__ajuda">Marque o que o ponto <strong>precisa agora</strong> e desmarque o que <strong>não precisa</strong>. O ponto continua aceitando qualquer peça; o que ele não precisa é encaminhado a outro ponto.</p>
              <div class="grupo-checkbox">${checks}</div>
              <button class="botao botao--secundario botao--pequeno" data-acao="salvar-pecas" data-id="${p.id}">Salvar alterações</button>
            </details>
          </div>
        `;
      })
      .join("");
  }

  /* Renderiza tudo */
  function renderizarTudo() {
    renderizarDoacoes();
    renderizarEstoque();
    renderizarRedistribuicao();
    renderizarPatrocinadores();
    renderizarPontos();
  }

  renderizarTudo();

  /* Delegação de eventos: trata os cliques nos botões do painel */
  document.querySelector("main").addEventListener("click", function (evento) {
    // Manutenção: salvar os itens que o ponto precisa no momento
    const salvar = evento.target.closest('button[data-acao="salvar-pecas"]');
    if (salvar) {
      const id = salvar.getAttribute("data-id");
      const detalhes = salvar.closest("details.gerenciar");
      const pecas = Array.from(
        detalhes.querySelectorAll('input[type="checkbox"]:checked')
      ).map((c) => c.value);

      const ponto = obterPontos().find((p) => p.id === Number(id));
      atualizarPecasPonto(id, pecas);
      // Itens necessários afetam estoque, encaminhamentos e a página de doação
      renderizarTudo();

      const resumo = pecas.length
        ? `Agora precisa de: <strong>${pecas.join(", ")}</strong>.`
        : "Sem itens prioritários no momento (continua aceitando qualquer peça).";
      mostrarAviso({
        tipo: "sucesso",
        titulo: "Alterações salvas!",
        mensagem: `Os itens de <strong>${ponto ? ponto.nome : "ponto"}</strong> foram atualizados. ${resumo}`,
      });
      return;
    }

    // Aprovar patrocinador/apoiador (passa a aparecer na página inicial)
    const aprovar = evento.target.closest('button[data-acao="aprovar-patrocinador"]');
    if (aprovar) {
      const id = aprovar.getAttribute("data-id");
      const registro = obterPatrocinadores().find((p) => p.id === Number(id));
      aprovarPatrocinador(id);
      renderizarPatrocinadores();
      mostrarAviso({
        tipo: "sucesso",
        titulo: "Aprovado!",
        mensagem: `<strong>${registro ? registro.nome : "Registro"}</strong> foi aprovado e já aparece na <a href="index.html#apoiadores">página inicial</a>.`,
      });
      return;
    }

    const botao = evento.target.closest("button[data-tipo]");
    if (!botao) return;

    const tipo = botao.getAttribute("data-tipo");
    const id = botao.getAttribute("data-id");

    if (tipo === "doacao") {
      if (confirm("Deseja remover esta doação?")) {
        removerDoacao(id);
        renderizarTudo(); // estoque e encaminhamentos dependem das doações
        mostrarAviso({ titulo: "Doação removida", mensagem: "A doação foi removida do painel." });
      }
    } else if (tipo === "ponto") {
      if (confirm("Deseja remover este ponto de coleta?")) {
        removerPonto(id);
        renderizarTudo(); // estoque e encaminhamentos dependem dos pontos
        mostrarAviso({ titulo: "Ponto removido", mensagem: "O ponto de coleta foi removido." });
      }
    } else if (tipo === "patrocinador") {
      if (confirm("Deseja remover este patrocinador?")) {
        removerPatrocinador(id);
        renderizarPatrocinadores();
        mostrarAviso({ titulo: "Registro removido", mensagem: "O patrocinador/apoiador foi removido." });
      }
    }
  });
});
