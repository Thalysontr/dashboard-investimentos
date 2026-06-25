// ---------------------------------------------------------------------------
// Dados iniciais (sementes). Na primeira vez, são copiados para o localStorage
// e a partir daí você edita tudo pela própria interface.
// Para "zerar", use o botão de reset na página Configurações.
// ---------------------------------------------------------------------------

// Carteira: cada posição é uma linha que você lança manualmente.
// - moeda: 'BRL' ou 'USD'
// - precoMedio: seu preço médio de compra (na moeda do ativo)
// - idCoingecko: só para cripto (id usado pela API CoinGecko)
// - precoAtualManual: opcional, usado p/ renda fixa ou quando não há cotação online
export const carteiraInicial = [
  { id: 'p1', ticker: 'PETR4', nome: 'Petrobras PN', classe: 'Ações BR', moeda: 'BRL', quantidade: 100, precoMedio: 32.5 },
  { id: 'p2', ticker: 'VALE3', nome: 'Vale ON', classe: 'Ações BR', moeda: 'BRL', quantidade: 80, precoMedio: 61.2 },
  { id: 'p3', ticker: 'ITUB4', nome: 'Itaú Unibanco PN', classe: 'Ações BR', moeda: 'BRL', quantidade: 120, precoMedio: 28.4 },
  { id: 'p4', ticker: 'MXRF11', nome: 'Maxi Renda FII', classe: 'FII', moeda: 'BRL', quantidade: 500, precoMedio: 10.1 },
  { id: 'p5', ticker: 'HGLG11', nome: 'CSHG Logística FII', classe: 'FII', moeda: 'BRL', quantidade: 40, precoMedio: 158.0 },
  { id: 'p6', ticker: 'AAPL', nome: 'Apple Inc.', classe: 'Ações EUA', moeda: 'USD', quantidade: 10, precoMedio: 175.0 },
  { id: 'p7', ticker: 'MSFT', nome: 'Microsoft', classe: 'Ações EUA', moeda: 'USD', quantidade: 6, precoMedio: 360.0 },
  { id: 'p8', ticker: 'BTC', nome: 'Bitcoin', classe: 'Cripto', moeda: 'BRL', quantidade: 0.05, precoMedio: 320000, idCoingecko: 'bitcoin' },
  { id: 'p9', ticker: 'ETH', nome: 'Ethereum', classe: 'Cripto', moeda: 'BRL', quantidade: 0.8, precoMedio: 18000, idCoingecko: 'ethereum' },
  { id: 'p10', ticker: 'TSOURO-SELIC-2029', nome: 'Tesouro Selic 2029', classe: 'Renda Fixa', moeda: 'BRL', quantidade: 1, precoMedio: 15000, precoAtualManual: 16200 },
  { id: 'p11', ticker: 'PREV-XP', nome: 'Previdência XP Seguros', classe: 'Previdência Privada', moeda: 'BRL', quantidade: 1, precoMedio: 20000, precoAtualManual: 21500 },
]

// Alocação-alvo por CLASSE (% — a soma ideal é 100%).
export const alocacaoAlvoInicial = {
  'Ações BR': 25,
  FII: 15,
  'Ações EUA': 20,
  Cripto: 10,
  'Renda Fixa': 20,
  'Previdência Privada': 10,
}

// Alocação-alvo por ATIVO, em % DENTRO da sua classe (soma ideal de 100% por grupo).
// Chave = id da posição. Sem valor definido, o app divide igualmente no grupo.
export const alvoAtivosInicial = {
  p1: 40, // PETR4
  p2: 35, // VALE3
  p3: 25, // ITUB4
  p4: 40, // MXRF11
  p5: 60, // HGLG11
  p6: 55, // AAPL
  p7: 45, // MSFT
  p8: 70, // BTC
  p9: 30, // ETH
  p10: 100, // Tesouro Selic
  p11: 100, // Previdência
}

// Metas de investimento.
export const metasIniciais = [
  { id: 'm1', titulo: 'Primeiro R$ 1 milhão', tipo: 'patrimonio', alvo: 1000000, prazo: '2032-12-31' },
  { id: 'm2', titulo: 'Reserva de emergência', tipo: 'valor', alvo: 50000, atual: 32000, prazo: '2026-12-31' },
  { id: 'm3', titulo: 'Ter 25% em ações dos EUA', tipo: 'classe', classe: 'Ações EUA', alvo: 25, prazo: '2027-06-30' },
]

// Doutrina de investimentos (texto editável; suporta # títulos e - listas).
export const doutrinaInicial = `# Minha Doutrina de Investimentos

## Princípios
- Invisto pensando no longo prazo (10+ anos), ignorando o ruído de curto prazo.
- Aporto todo mês, independentemente do humor do mercado.
- Diversifico entre classes de ativos e países.
- Só invisto no que entendo.

## Regras de aporte
- Direciono novos aportes para a classe mais distante do alvo (rebalanceamento por aporte).
- Mantenho a reserva de emergência sempre completa antes de aumentar risco.

## O que NÃO faço
- Não tento adivinhar o topo ou o fundo do mercado.
- Não vendo bons ativos por pânico em quedas.
- Não concentro mais de 10% em um único ativo de risco.
`
