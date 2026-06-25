// Formatadores em pt-BR.

export const brl = (n) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0)

export const num = (n, casas = 0) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(n || 0)

// Percentual com sinal (para variações): +12,4%
export const pctSinal = (n, casas = 1) =>
  `${n >= 0 ? '+' : '−'}${num(Math.abs(n || 0), casas)}%`

// Percentual sem sinal: 12,4%
export const pct = (n, casas = 1) => `${num(n || 0, casas)}%`

// Data legível: 25 jun 2026
export const dataCurta = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
