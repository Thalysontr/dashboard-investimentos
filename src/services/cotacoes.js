// ---------------------------------------------------------------------------
// Busca de cotações ao vivo, com cache diário no localStorage.
// Fontes (todas gratuitas, com CORS liberado):
//   - Câmbio USD/BRL: AwesomeAPI (sem chave)
//   - Cripto:         CoinGecko (sem chave, já retorna preço em BRL)
//   - Ações B3/FII:   brapi.dev (token opcional p/ liberar todos os tickers)
//   - Ações EUA:      Twelve Data (chave necessária)
// Sem token/chave, esses ativos caem no preço manual/preço médio.
// ---------------------------------------------------------------------------

const CACHE_KEY = 'cotacoes_cache_v1'
const CFG_KEY = 'config_apis_v1'
const HIST_KEY = 'historico_v1'

// Validade do cache de cotações: 15 minutos.
export const CACHE_TTL_MS = 15 * 60 * 1000

const hoje = () => new Date().toISOString().slice(0, 10)

// fetch com timeout (evita travar caso uma API esteja lenta/indisponível).
async function fetchJson(url, ms = 8000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const r = await fetch(url, { signal: ctrl.signal })
    return await r.json()
  } finally {
    clearTimeout(t)
  }
}

export function getConfigApis() {
  try {
    return JSON.parse(localStorage.getItem(CFG_KEY)) || {}
  } catch {
    return {}
  }
}

export function setConfigApis(cfg) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg))
}

export async function buscarCotacoes(carteira, { forcar = false } = {}) {
  if (!forcar) {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY))
      // Reaproveita o cache se ele tiver menos de 15 minutos.
      if (c && c.salvoEmMs && Date.now() - c.salvoEmMs < CACHE_TTL_MS) return c
    } catch {
      /* sem cache */
    }
  }

  const cfg = getConfigApis()
  const precos = {}
  let cambioUsdBrl = 5.0

  // 1) Câmbio USD/BRL
  try {
    const j = await fetchJson('https://economia.awesomeapi.com.br/json/last/USD-BRL')
    const bid = parseFloat(j?.USDBRL?.bid)
    if (bid > 0) cambioUsdBrl = bid
  } catch {
    /* mantém fallback */
  }

  // 2) Cripto (CoinGecko) — já em BRL
  const cryptos = carteira.filter((p) => p.classe === 'Cripto' && p.idCoingecko)
  if (cryptos.length) {
    try {
      const ids = [...new Set(cryptos.map((p) => p.idCoingecko))].join(',')
      const j = await fetchJson(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl`,
      )
      cryptos.forEach((p) => {
        const v = j?.[p.idCoingecko]?.brl
        if (v > 0) precos[p.ticker] = v
      })
    } catch {
      /* ignora */
    }
  }

  // 3) Ações B3 e FIIs (brapi)
  const brTickers = carteira
    .filter((p) => p.classe === 'Ações BR' || p.classe === 'FII')
    .map((p) => p.ticker)
  if (brTickers.length) {
    const aplicar = (res) => {
      if (res?.regularMarketPrice > 0) precos[res.symbol] = res.regularMarketPrice
    }
    if (cfg.brapiToken) {
      // Com token: uma única requisição com todos os tickers.
      try {
        const j = await fetchJson(
          `https://brapi.dev/api/quote/${brTickers.join(',')}?token=${cfg.brapiToken}`,
        )
        ;(j?.results || []).forEach(aplicar)
      } catch {
        /* ignora */
      }
    } else {
      // Sem token: a brapi free recusa requisições com vários tickers,
      // então buscamos um por um (os tickers gratuitos funcionam).
      await Promise.all(
        brTickers.map(async (tk) => {
          try {
            const j = await fetchJson(`https://brapi.dev/api/quote/${tk}`)
            aplicar(j?.results?.[0])
          } catch {
            /* ignora ticker que exige token */
          }
        }),
      )
    }
  }

  // 4) Ações EUA (Twelve Data) — requer chave
  const usTickers = carteira.filter((p) => p.classe === 'Ações EUA').map((p) => p.ticker)
  if (usTickers.length && cfg.twelveDataKey) {
    try {
      const j = await fetchJson(
        `https://api.twelvedata.com/price?symbol=${usTickers.join(',')}&apikey=${cfg.twelveDataKey}`,
      )
      if (usTickers.length === 1) {
        const v = parseFloat(j?.price)
        if (v > 0) precos[usTickers[0]] = v
      } else {
        usTickers.forEach((t) => {
          const v = parseFloat(j?.[t]?.price)
          if (v > 0) precos[t] = v
        })
      }
    } catch {
      /* ignora */
    }
  }

  const resultado = {
    data: hoje(),
    salvoEmMs: Date.now(),
    atualizadoEm: new Date().toISOString(),
    precos,
    cambioUsdBrl,
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(resultado))
  } catch {
    /* ignora */
  }
  return resultado
}

// --- Histórico do patrimônio (snapshot diário local) ----------------------

export function getHistorico() {
  try {
    return JSON.parse(localStorage.getItem(HIST_KEY)) || []
  } catch {
    return []
  }
}

export function registrarSnapshot(total) {
  try {
    const arr = getHistorico()
    const d = hoje()
    const idx = arr.findIndex((x) => x.data === d)
    if (idx >= 0) arr[idx].total = total
    else arr.push({ data: d, total })
    localStorage.setItem(HIST_KEY, JSON.stringify(arr))
    return arr
  } catch {
    return []
  }
}

export const CHAVES_STORAGE = [
  'carteira_v1',
  'alvo_v1',
  'alvoAtivos_v1',
  'metas_v1',
  'doutrina_v1',
  CACHE_KEY,
  CFG_KEY,
  HIST_KEY,
]
