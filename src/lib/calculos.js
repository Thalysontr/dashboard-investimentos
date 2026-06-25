// ---------------------------------------------------------------------------
// Cálculos da carteira: valor de mercado, lucro/prejuízo, alocação,
// rebalanceamento e progresso de metas.
// Todos os valores consolidados são em BRL.
// ---------------------------------------------------------------------------

// Classes de ativo e suas cores (usadas em gráficos e selos).
export const CLASSES = [
  'Ações BR',
  'FII',
  'Ações EUA',
  'Cripto',
  'Renda Fixa',
  'Previdência Privada',
]

export const CORES_CLASSE = {
  'Ações BR': '#1687F9',
  FII: '#22C55E',
  'Ações EUA': '#8B5CF6',
  Cripto: '#F59E0B',
  'Renda Fixa': '#14B8A6',
  'Previdência Privada': '#6366F1',
}

// Calcula métricas de cada posição.
// precos: { TICKER: precoNaMoedaDoAtivo }
// cambioUsdBrl: cotação do dólar em reais
export function calcularPosicoes(carteira, precos = {}, cambioUsdBrl = 1) {
  return carteira.map((p) => {
    const cotacao = precos?.[p.ticker]
    const temCotacao = typeof cotacao === 'number' && cotacao > 0
    // Sem cotação ao vivo, usa preço manual informado ou cai no preço médio.
    const precoAtual = temCotacao ? cotacao : p.precoAtualManual ?? p.precoMedio
    const fator = p.moeda === 'USD' ? cambioUsdBrl : 1

    const precoAtualBRL = precoAtual * fator
    const valorMercado = precoAtualBRL * p.quantidade
    const custoBRL = p.precoMedio * fator * p.quantidade
    const lucro = valorMercado - custoBRL
    const lucroPct = custoBRL > 0 ? (lucro / custoBRL) * 100 : 0

    return {
      ...p,
      precoAtual,
      precoAtualBRL,
      valorMercado,
      custoBRL,
      lucro,
      lucroPct,
      temCotacao,
    }
  })
}

// Resumo geral da carteira a partir das posições já calculadas.
export function resumoCarteira(posicoes) {
  const total = posicoes.reduce((s, p) => s + p.valorMercado, 0)
  const custo = posicoes.reduce((s, p) => s + p.custoBRL, 0)
  const lucro = total - custo
  const lucroPct = custo > 0 ? (lucro / custo) * 100 : 0

  const porClasse = CLASSES.map((classe) => {
    const itens = posicoes.filter((p) => p.classe === classe)
    const valor = itens.reduce((s, p) => s + p.valorMercado, 0)
    return { classe, valor, pct: total > 0 ? (valor / total) * 100 : 0 }
  }).filter((c) => c.valor > 0)

  return { total, custo, lucro, lucroPct, porClasse }
}

// Rebalanceamento em dois níveis:
//   1) % por classe (grupo)            -> alvoClasses[classe]
//   2) % de cada ativo dentro da classe -> alvoAtivos[idDaPosicao]
// Sugere quanto comprar (+) ou vender (−) por classe e por ativo,
// considerando um aporte opcional. O % efetivo sobre o total também é exposto.
export function calcularRebalanceamento(
  posicoes,
  alvoClasses = {},
  alvoAtivos = {},
  total = 0,
  aporte = 0,
) {
  const totalFinal = total + aporte

  return CLASSES.map((classe) => {
    const itens = posicoes.filter((p) => p.classe === classe)
    const atualValorClasse = itens.reduce((s, p) => s + p.valorMercado, 0)
    const alvoPctClasse = alvoClasses[classe] || 0
    const alvoValorClasse = (totalFinal * alvoPctClasse) / 100
    const atualPctClasse = total > 0 ? (atualValorClasse / total) * 100 : 0

    // Peso de cada ativo DENTRO da classe. Sem valor definido, divide igualmente.
    const padrao = itens.length ? 100 / itens.length : 0
    const ativos = itens.map((p) => {
      const pctDentro = alvoAtivos[p.id] != null ? alvoAtivos[p.id] : padrao
      const alvoValor = (alvoValorClasse * pctDentro) / 100
      const ajuste = alvoValor - p.valorMercado
      const pctTotalEfetivo = (alvoPctClasse * pctDentro) / 100
      return {
        id: p.id,
        ticker: p.ticker,
        nome: p.nome,
        atualValor: p.valorMercado,
        pctDentro,
        alvoValor,
        ajuste,
        pctTotalEfetivo,
        ehPadrao: alvoAtivos[p.id] == null,
      }
    })
    const somaDentro = ativos.reduce((s, a) => s + a.pctDentro, 0)

    const ajusteClasse = alvoValorClasse - atualValorClasse
    return {
      classe,
      atualValorClasse,
      atualPctClasse,
      alvoPctClasse,
      alvoValorClasse,
      ajusteClasse,
      ativos,
      somaDentro,
    }
  }).filter((g) => g.alvoPctClasse > 0 || g.atualValorClasse > 0)
}

// Progresso de uma meta, conforme o tipo.
// tipos: 'patrimonio' (alvo em R$, atual = total da carteira)
//        'classe'     (alvo em % de uma classe, atual = % atual da classe)
//        'valor'      (alvo em R$, atual informado manualmente)
export function progressoMeta(meta, resumo) {
  let atual = meta.atual ?? 0
  let alvo = meta.alvo ?? 0

  if (meta.tipo === 'patrimonio') {
    atual = resumo.total
  } else if (meta.tipo === 'classe') {
    atual = resumo.porClasse.find((c) => c.classe === meta.classe)?.pct ?? 0
  }

  const pct = alvo > 0 ? Math.min((atual / alvo) * 100, 100) : 0
  return { atual, alvo, pct }
}
