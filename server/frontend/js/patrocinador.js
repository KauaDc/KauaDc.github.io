/* =========================================================
   Armário Social — Página "Seja um patrocinador"
   Registra uma empresa/organização como patrocinador ou apoiador.
   Os cadastrados aparecem no mural da página inicial e no painel.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-patrocinador");

  form.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const responsavel = document.getElementById("responsavel").value.trim();
    const contato = document.getElementById("contato").value.trim();
    const site = document.getElementById("site").value.trim();
    const nivel = document.getElementById("nivel").value;
    const mensagem = document.getElementById("mensagem").value.trim();

    // Validação simples
    if (!nome || !responsavel || !contato || !nivel) {
      mostrarAviso({
        tipo: "aviso",
        titulo: "Faltam informações",
        mensagem: "Preencha nome, responsável, contato e o nível de apoio.",
        duracao: 0,
      });
      return;
    }

    // Salva o patrocinador/apoiador no banco
    try {
      await salvarPatrocinador({
        nome: nome,
        responsavel: responsavel,
        contato: contato,
        site: site,
        nivel: nivel,
        mensagem: mensagem,
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
    const artigo = nivel === "Patrocinador" ? "patrocinador" : "apoiador";
    form.reset();
    mostrarAviso({
      tipo: "sucesso",
      titulo: "Cadastro recebido!",
      mensagem: `Obrigado, <strong>${nome}</strong>! Seu cadastro como ${artigo} está <strong>aguardando aprovação</strong>. Assim que for aprovado, aparecerá no mural da página inicial.`,
      duracao: 0,
    });
  });
});
