/* =========================================================
   Armário Social — Mural de patrocinadores (página inicial)
   Acrescenta os patrocinadores/apoiadores cadastrados (localStorage)
   às grades de logos, usando um "monograma" (inicial + cor) como marca.
   ========================================================= */
document.addEventListener("DOMContentLoaded", async function () {
  const grids = {
    Patrocinador: document.getElementById("logos-patrocinadores"),
    Apoiador: document.getElementById("logos-apoiadores"),
  };
  if (!grids.Patrocinador && !grids.Apoiador) return;

  // Paleta usada para colorir o monograma de forma consistente por nome
  const cores = [
    "#2a9d8f", "#f2994a", "#2980b9", "#8e44ad",
    "#e23b3b", "#27ae60", "#d4a017", "#34495e",
  ];

  function corDoNome(nome) {
    let soma = 0;
    for (let i = 0; i < nome.length; i++) soma += nome.charCodeAt(i);
    return cores[soma % cores.length];
  }

  // Mural decorativo: se a API falhar, apenas mantém os logos de exemplo.
  let aprovados = [];
  try {
    aprovados = await obterPatrocinadoresAprovados();
  } catch (erro) {
    console.error("Não foi possível carregar os apoiadores:", erro.message);
    return;
  }

  aprovados.forEach(function (p) {
    const grid = grids[p.nivel] || grids.Apoiador;
    if (!grid) return;

    const link = document.createElement("a");
    link.className = "logo-apoiador";
    link.setAttribute("aria-label", `${p.nivel}: ${p.nome}`);
    if (p.site) {
      link.href = p.site;
      link.target = "_blank";
      link.rel = "noopener";
    } else {
      link.href = "#";
    }

    const mono = document.createElement("span");
    mono.className = "logo-apoiador__mono";
    mono.style.backgroundColor = corDoNome(p.nome);
    mono.setAttribute("aria-hidden", "true");
    mono.textContent = p.nome.trim().charAt(0).toUpperCase();

    const nome = document.createElement("span");
    nome.className = "logo-apoiador__nome";
    nome.textContent = p.nome;

    link.append(mono, nome);
    grid.appendChild(link);
  });
});
