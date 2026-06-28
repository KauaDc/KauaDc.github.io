/* =========================================================
   Armário Social — Cálculo de estoque e redistribuição
   Funções puras (recebem pontos e doações já carregados).
   Regra: todo ponto aceita qualquer peça, mas precisa de itens
   específicos (ponto.pecas). O que um ponto recebe e não precisa
   é "excedente" e deve ser encaminhado a outro ponto que precise.
   Antes ficava no front (js/dados.js); foi movido para o servidor
   para que o usuário comum veja os agregados sem receber as
   doações cruas (que têm dados pessoais dos doadores).
   ========================================================= */

/* Para cada ponto, o que ele recebeu em doações.
   Retorna: [{ ponto, itens: [{ peca, quantidade, precisa }], totalPecas }] */
function calcularEstoque(pontos, doacoes) {
  return pontos.map((ponto) => {
    const contagem = {}; // peca -> nº de doações
    let totalPecas = 0;

    doacoes
      .filter((d) => d.pontoId === ponto.id)
      .forEach((d) => {
        totalPecas += Number(d.quantidade) || 0;
        d.pecas.forEach((peca) => {
          contagem[peca] = (contagem[peca] || 0) + 1;
        });
      });

    const itens = Object.keys(contagem)
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .map((peca) => ({
        peca: peca,
        quantidade: contagem[peca],
        precisa: ponto.pecas.includes(peca),
      }));

    return { ponto: ponto, itens: itens, totalPecas: totalPecas };
  });
}

/* Itens excedentes e os pontos para onde encaminhar.
   Retorna: [{ peca, origem: ponto, quantidade, destinos: [pontos] }] */
function calcularRedistribuicoes(pontos, doacoes) {
  const lista = [];

  calcularEstoque(pontos, doacoes).forEach(({ ponto, itens }) => {
    itens
      .filter((item) => !item.precisa)
      .forEach((item) => {
        const destinos = pontos.filter(
          (p) => p.id !== ponto.id && p.pecas.includes(item.peca)
        );
        lista.push({
          peca: item.peca,
          origem: ponto,
          quantidade: item.quantidade,
          destinos: destinos,
        });
      });
  });

  return lista;
}

module.exports = { calcularEstoque, calcularRedistribuicoes };
