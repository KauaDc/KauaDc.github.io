/* =========================================================
   Armário Social — Página "Seja parceiro"
   Cadastra um novo ponto de coleta, que passa a aparecer
   na página de Pontos de coleta.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-parceiro");
  const grupoPecas = document.getElementById("grupo-pecas");

  /* Gera os checkboxes de tipos de peça */
  function carregarPecas() {
    TIPOS_DE_PECA.forEach((peca, indice) => {
      const id = `peca-${indice}`;
      const label = document.createElement("label");
      label.setAttribute("for", id);
      label.innerHTML = `<input type="checkbox" id="${id}" name="pecas" value="${peca}" /> ${peca}`;
      grupoPecas.appendChild(label);
    });
  }

  carregarPecas();

  /* Tratamento do envio */
  form.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const responsavel = document.getElementById("responsavel").value.trim();
    const email = document.getElementById("email").value.trim();
    const endereco = document.getElementById("endereco").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const horario = document.getElementById("horario").value.trim();

    const pecasMarcadas = Array.from(
      form.querySelectorAll('input[name="pecas"]:checked')
    ).map((c) => c.value);

    // Validação simples
    if (!nome || !responsavel || !email || !endereco || !bairro || !cidade || !horario || pecasMarcadas.length === 0) {
      mostrarAviso({
        tipo: "aviso",
        titulo: "Faltam informações",
        mensagem: "Preencha todos os campos e selecione ao menos um tipo de peça.",
        duracao: 0,
      });
      return;
    }

    // Salva o novo ponto no banco
    try {
      await salvarPonto({
        nome: nome,
        responsavel: responsavel,
        email: email,
        endereco: endereco,
        bairro: bairro,
        cidade: cidade,
        horario: horario,
        pecas: pecasMarcadas,
      });
    } catch (erro) {
      mostrarAviso({
        tipo: "aviso",
        titulo: "Não foi possível cadastrar",
        mensagem: erro.message,
        duracao: 0,
      });
      return;
    }

    // Confirma com o modal de aviso
    form.reset();
    mostrarAviso({
      tipo: "sucesso",
      titulo: "Ponto cadastrado!",
      mensagem: `<strong>${nome}</strong> já aparece na <a href="pontos.html">página de pontos de coleta</a>.`,
      duracao: 0,
    });
  });
});
