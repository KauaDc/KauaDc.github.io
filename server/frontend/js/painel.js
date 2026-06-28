/* =========================================================
   Armário Social — Painel do administrador
   Três papéis:
   - admin: vê e gerencia tudo (doações com identidade, excluir,
     aprovar patrocinadores, criar/remover contas de parceiro).
   - parceiro: vê pontos, estoque e encaminhamentos e gerencia os
     itens necessários dos pontos (editar). Não vê doações, não
     exclui, não aprova.
   - comum (visitante): só leitura do que é público.
   O servidor também barra os recursos restritos (defesa em
   profundidade).
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const statusEl = document.getElementById("painel-status");
  const secaoDoacoesEl = document.getElementById("secao-doacoes");
  const secaoParceirosEl = document.getElementById("secao-parceiros");
  const listaDoacoesEl = document.getElementById("lista-doacoes");
  const listaPontosEl = document.getElementById("lista-pontos-painel");
  const listaEstoqueEl = document.getElementById("lista-estoque");
  const listaRedistEl = document.getElementById("lista-redist");
  const listaPatrocinadoresEl = document.getElementById("lista-patrocinadores");
  const listaParceirosEl = document.getElementById("lista-parceiros");
  const semDoacoesEl = document.getElementById("sem-doacoes");
  const semPontosEl = document.getElementById("sem-pontos");
  const semEstoqueEl = document.getElementById("sem-estoque");
  const semRedistEl = document.getElementById("sem-redist");
  const semPatrocinadoresEl = document.getElementById("sem-patrocinadores");
  const semParceirosEl = document.getElementById("sem-parceiros");
  const totalDoacoesEl = document.getElementById("total-doacoes");
  const totalPontosEl = document.getElementById("total-pontos");
  const totalRedistEl = document.getElementById("total-redist");
  const totalPatrocinadoresEl = document.getElementById("total-patrocinadores");
  const totalParceirosEl = document.getElementById("total-parceiros");
  const formConta = document.getElementById("form-conta-parceiro");

  // Papel atual e dados carregados da API.
  let papel = "comum"; // "comum" | "parceiro" | "admin"
  let admin = false;
  let logado = false;

  let pontos = [];
  let doacoes = [];
  let patrocinadores = [];
  let estoque = [];
  let redistribuicoes = [];
  let parceiros = [];

  /* Barra de status no topo (vazia para visitante). */
  function renderizarStatus() {
    if (!statusEl) return;
    if (!logado) {
      statusEl.innerHTML = "";
      return;
    }
    const dados = parceiroAtual();
    const usuario = dados && dados.usuario ? dados.usuario : "usuário";
    const rotulo = admin ? "administrador" : "parceiro";
    statusEl.innerHTML = `
      <div class="item-painel" style="align-items:center;">
        <div class="item-painel__dados">
          <strong>Logado como ${usuario}</strong> (${rotulo}).
        </div>
        <button class="botao botao--secundario botao--pequeno" id="btn-sair">Sair</button>
      </div>`;
    const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
      btnSair.addEventListener("click", function () {
        logout();
        window.location.href = "index.html";
      });
    }
  }

  /* Doações — só admin (contém identidade do doador). */
  function renderizarDoacoes() {
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

  /* Estoque de cada ponto (só pontos que receberam algo). */
  function renderizarEstoque() {
    const lista = estoque.filter((e) => e.itens.length > 0);

    if (lista.length === 0) {
      listaEstoqueEl.innerHTML = "";
      semEstoqueEl.classList.remove("oculto");
      return;
    }

    semEstoqueEl.classList.add("oculto");
    listaEstoqueEl.innerHTML = lista
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

  /* Encaminhamentos sugeridos (itens excedentes -> destinos). */
  function renderizarRedistribuicao() {
    totalRedistEl.textContent = redistribuicoes.length;

    if (redistribuicoes.length === 0) {
      listaRedistEl.innerHTML = "";
      semRedistEl.classList.remove("oculto");
      return;
    }

    semRedistEl.classList.add("oculto");
    listaRedistEl.innerHTML = redistribuicoes
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

  /* Patrocinadores. Ações (aprovar/remover) só para admin. */
  function renderizarPatrocinadores() {
    totalPatrocinadoresEl.textContent = patrocinadores.length;

    if (patrocinadores.length === 0) {
      listaPatrocinadoresEl.innerHTML = "";
      semPatrocinadoresEl.classList.remove("oculto");
      return;
    }

    semPatrocinadoresEl.classList.add("oculto");

    const ordenada = [...patrocinadores].sort(function (a, b) {
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

        let acoes = "";
        if (admin) {
          const botaoAprovar = p.aprovado
            ? ""
            : `<button class="botao botao--secundario botao--pequeno" data-acao="aprovar-patrocinador" data-id="${p.id}">Aprovar</button>`;
          acoes = `
            <div class="item-painel__acoes">
              ${botaoAprovar}
              <button class="botao botao--perigo botao--pequeno" data-tipo="patrocinador" data-id="${p.id}">Remover</button>
            </div>`;
        }

        return `
          <div class="item-painel">
            <div class="item-painel__dados">
              <h3>${p.nome} <span style="font-weight:400;color:var(--cor-texto-suave);font-size:0.9rem;">(${p.nivel})</span> ${status}</h3>
              <p><strong>Responsável:</strong> ${p.responsavel}</p>
              <p><strong>Contato:</strong> ${p.contato}</p>
              ${site}
              ${msg}
            </div>
            ${acoes}
          </div>
        `;
      })
      .join("");
  }

  /* Pontos. "Gerenciar itens" para parceiro/admin; "Remover" só admin. */
  function renderizarPontos() {
    totalPontosEl.textContent = pontos.length;

    if (pontos.length === 0) {
      listaPontosEl.innerHTML = "";
      semPontosEl.classList.remove("oculto");
      return;
    }

    semPontosEl.classList.add("oculto");
    listaPontosEl.innerHTML = pontos
      .map(function (p) {
        const precisaTexto = p.pecas.length
          ? `${p.pecas.join(", ")} <em style="color:var(--cor-texto-suave);">(aceita qualquer peça)</em>`
          : `<em style="color:var(--cor-texto-suave);">nada no momento — aceita qualquer peça</em>`;

        const botaoRemover = admin
          ? `<button class="botao botao--perigo botao--pequeno" data-tipo="ponto" data-id="${p.id}">Remover</button>`
          : "";

        let gerenciar = "";
        if (logado) {
          const checks = TIPOS_DE_PECA.map(function (peca, i) {
            const cid = `ponto-${p.id}-peca-${i}`;
            const marcado = p.pecas.includes(peca) ? " checked" : "";
            return `<label for="${cid}"><input type="checkbox" id="${cid}" value="${peca}"${marcado} /> ${peca}</label>`;
          }).join("");
          gerenciar = `
            <details class="gerenciar">
              <summary>Gerenciar itens necessários</summary>
              <p class="campo__ajuda">Marque o que o ponto <strong>precisa agora</strong> e desmarque o que <strong>não precisa</strong>. O ponto continua aceitando qualquer peça; o que ele não precisa é encaminhado a outro ponto.</p>
              <div class="grupo-checkbox">${checks}</div>
              <button class="botao botao--secundario botao--pequeno" data-acao="salvar-pecas" data-id="${p.id}">Salvar alterações</button>
            </details>`;
        }

        return `
          <div class="item-painel">
            <div class="item-painel__dados">
              <h3>${p.nome}</h3>
              <p><strong>Endereço:</strong> ${p.endereco}, ${p.bairro}, ${p.cidade}</p>
              <p><strong>Responsável:</strong> ${p.responsavel}</p>
              ${p.email ? `<p><strong>E-mail:</strong> ${p.email}</p>` : ""}
              <p><strong>Horário:</strong> ${p.horario}</p>
              <p><strong>Precisa de:</strong> ${precisaTexto}</p>
            </div>
            ${botaoRemover}
            ${gerenciar}
          </div>
        `;
      })
      .join("");
  }

  /* Contas de parceiro — só admin. */
  function renderizarParceiros() {
    totalParceirosEl.textContent = parceiros.length;

    if (parceiros.length === 0) {
      listaParceirosEl.innerHTML = "";
      semParceirosEl.classList.remove("oculto");
      return;
    }

    semParceirosEl.classList.add("oculto");
    listaParceirosEl.innerHTML = parceiros
      .map(function (p) {
        const nome = p.nome
          ? `<span style="font-weight:400;color:var(--cor-texto-suave);font-size:0.9rem;">(${p.nome})</span>`
          : "";
        return `
          <div class="item-painel">
            <div class="item-painel__dados">
              <h3>${p.usuario} ${nome}</h3>
              <p style="color:var(--cor-texto-suave);font-size:0.9rem;">Criada em ${p.criadoEm}</p>
            </div>
            <button class="botao botao--perigo botao--pequeno" data-acao="remover-parceiro" data-id="${p.id}">Remover</button>
          </div>
        `;
      })
      .join("");
  }

  /* Carrega os dados conforme o papel e renderiza o painel. */
  async function renderizarTudo() {
    try {
      const [p, e, r, pat, d, par] = await Promise.all([
        obterPontos(),
        obterEstoque(),
        obterRedistribuicoes(),
        admin ? obterPatrocinadores() : obterPatrocinadoresAprovados(),
        admin ? obterDoacoes() : Promise.resolve([]),
        admin ? obterParceiros() : Promise.resolve([]),
      ]);
      pontos = p;
      estoque = e;
      redistribuicoes = r;
      patrocinadores = pat;
      doacoes = d;
      parceiros = par;
    } catch (erro) {
      mostrarAviso({
        tipo: "aviso",
        titulo: "Erro ao carregar o painel",
        mensagem: erro.message,
        duracao: 0,
      });
      return;
    }

    if (admin) renderizarDoacoes();
    renderizarEstoque();
    renderizarRedistribuicao();
    renderizarPatrocinadores();
    renderizarPontos();
    if (admin) renderizarParceiros();
  }

  /* Define o papel (valida o token no servidor) e monta o painel. */
  async function iniciar() {
    papel = "comum";
    if (estaLogado()) {
      try {
        const sessao = await obterSessao(); // confirma token e papel (GET /api/me)
        papel = sessao.role || "parceiro";
      } catch (erro) {
        logout(); // token inválido/expirado -> visitante
        papel = "comum";
      }
    }
    admin = papel === "admin";
    logado = papel !== "comum";

    renderizarStatus();
    if (secaoDoacoesEl) secaoDoacoesEl.style.display = admin ? "" : "none";
    if (secaoParceirosEl) secaoParceirosEl.style.display = admin ? "" : "none";
    await renderizarTudo();
  }

  iniciar();

  /* Cadastro de conta de parceiro (admin). */
  if (formConta) {
    formConta.addEventListener("submit", async function (evento) {
      evento.preventDefault();
      const usuario = document.getElementById("conta-usuario").value.trim();
      const senha = document.getElementById("conta-senha").value;
      const nome = document.getElementById("conta-nome").value.trim();

      if (!usuario || !senha) {
        mostrarAviso({
          tipo: "aviso",
          titulo: "Faltam informações",
          mensagem: "Informe ao menos usuário e senha.",
          duracao: 0,
        });
        return;
      }

      try {
        await criarParceiro({ usuario: usuario, senha: senha, nome: nome });
        formConta.reset();
        await renderizarTudo();
      } catch (erro) {
        mostrarAviso({
          tipo: "aviso",
          titulo: "Não foi possível criar a conta",
          mensagem: erro.message,
          duracao: 0,
        });
        return;
      }

      mostrarAviso({
        tipo: "sucesso",
        titulo: "Conta criada!",
        mensagem: `O parceiro <strong>${usuario}</strong> já pode entrar pela tela de login.`,
      });
    });
  }

  /* Delegação de eventos: ações conforme o papel (a API também barra). */
  document.querySelector("main").addEventListener("click", async function (evento) {
    // Salvar itens necessários de um ponto (parceiro/admin).
    const salvar = evento.target.closest('button[data-acao="salvar-pecas"]');
    if (salvar) {
      const id = salvar.getAttribute("data-id");
      const detalhes = salvar.closest("details.gerenciar");
      const pecas = Array.from(
        detalhes.querySelectorAll('input[type="checkbox"]:checked')
      ).map((c) => c.value);

      const ponto = pontos.find((p) => p.id === Number(id));
      try {
        await atualizarPecasPonto(id, pecas);
        await renderizarTudo();
      } catch (erro) {
        mostrarAviso({ tipo: "aviso", titulo: "Erro ao salvar", mensagem: erro.message, duracao: 0 });
        return;
      }

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

    // Aprovar patrocinador (admin).
    const aprovar = evento.target.closest('button[data-acao="aprovar-patrocinador"]');
    if (aprovar) {
      const id = aprovar.getAttribute("data-id");
      const registro = patrocinadores.find((p) => p.id === Number(id));
      try {
        await aprovarPatrocinador(id);
        await renderizarTudo();
      } catch (erro) {
        mostrarAviso({ tipo: "aviso", titulo: "Erro ao aprovar", mensagem: erro.message, duracao: 0 });
        return;
      }
      mostrarAviso({
        tipo: "sucesso",
        titulo: "Aprovado!",
        mensagem: `<strong>${registro ? registro.nome : "Registro"}</strong> foi aprovado e já aparece na <a href="index.html#apoiadores">página inicial</a>.`,
      });
      return;
    }

    // Remover conta de parceiro (admin).
    const removerConta = evento.target.closest('button[data-acao="remover-parceiro"]');
    if (removerConta) {
      const id = removerConta.getAttribute("data-id");
      if (!confirm("Remover esta conta de parceiro?")) return;
      try {
        await removerParceiro(id);
        await renderizarTudo();
        mostrarAviso({ titulo: "Conta removida", mensagem: "A conta de parceiro foi removida." });
      } catch (erro) {
        mostrarAviso({ tipo: "aviso", titulo: "Erro ao remover", mensagem: erro.message, duracao: 0 });
      }
      return;
    }

    // Remoções (admin): doação, ponto, patrocinador.
    const botao = evento.target.closest("button[data-tipo]");
    if (!botao) return;

    const tipo = botao.getAttribute("data-tipo");
    const id = botao.getAttribute("data-id");

    try {
      if (tipo === "doacao") {
        if (!confirm("Deseja remover esta doação?")) return;
        await removerDoacao(id);
        await renderizarTudo();
        mostrarAviso({ titulo: "Doação removida", mensagem: "A doação foi removida do painel." });
      } else if (tipo === "ponto") {
        if (!confirm("Deseja remover este ponto de coleta?")) return;
        await removerPonto(id);
        await renderizarTudo();
        mostrarAviso({ titulo: "Ponto removido", mensagem: "O ponto de coleta foi removido." });
      } else if (tipo === "patrocinador") {
        if (!confirm("Deseja remover este patrocinador?")) return;
        await removerPatrocinador(id);
        await renderizarTudo();
        mostrarAviso({ titulo: "Registro removido", mensagem: "O patrocinador/apoiador foi removido." });
      }
    } catch (erro) {
      mostrarAviso({ tipo: "aviso", titulo: "Erro ao remover", mensagem: erro.message, duracao: 0 });
    }
  });
});
