import { useState } from 'react'
import { Save, RotateCcw, KeyRound, Info, Timer } from 'lucide-react'
import { getConfigApis, setConfigApis, CHAVES_STORAGE } from '../services/cotacoes'
import { limparTudo } from '../lib/armazenamento'
import { useApp } from '../store/store'
import DashboardCard from '../components/DashboardCard'

const OPCOES_INTERVALO = [5, 15, 30, 60]

const inputCls =
  'w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10'

export default function Configuracoes() {
  const { intervaloMin, setIntervaloMin } = useApp()
  const cfg = getConfigApis()
  const [brapiToken, setBrapiToken] = useState(cfg.brapiToken || '')
  const [twelveDataKey, setTwelveDataKey] = useState(cfg.twelveDataKey || '')
  const [salvo, setSalvo] = useState(false)

  function salvar() {
    setConfigApis({ brapiToken: brapiToken.trim(), twelveDataKey: twelveDataKey.trim() })
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  function resetar() {
    if (confirm('Isso apaga sua carteira, metas, doutrina e configurações deste navegador. Continuar?')) {
      limparTudo(CHAVES_STORAGE)
      location.reload()
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <DashboardCard
        title="Atualização das cotações"
        subtitle="De quanto em quanto tempo buscar os preços"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Timer size={18} />
          </span>
          <div className="flex flex-wrap gap-2">
            {OPCOES_INTERVALO.map((min) => (
              <button
                key={min}
                onClick={() => setIntervaloMin(min)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  intervaloMin === min
                    ? 'border-brand bg-brand text-white shadow-brand'
                    : 'border-line bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          O app revalida sozinho nesse intervalo enquanto estiver aberto. Obs.: no plano gratuito da
          brapi, a cotação da B3 tem ~15 min de atraso — abaixo disso, ações/FIIs não trazem preço
          mais novo (cripto e dólar são quase em tempo real).
        </p>
      </DashboardCard>

      <DashboardCard
        title="Chaves de API (cotações)"
        subtitle="Opcional — liberam cotações automáticas de mais ativos"
      >
        <div className="mb-5 flex gap-3 rounded-xl bg-brand-soft p-4 text-sm text-brand-dark">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>
            Cripto e câmbio USD/BRL já funcionam <strong>sem chave</strong>. Para cotações de todas
            as ações da B3, gere um token grátis em <strong>brapi.dev</strong>. Para ações dos EUA,
            crie uma chave grátis em <strong>twelvedata.com</strong>. Sem chave, esses ativos usam o
            preço manual que você informar.
          </p>
        </div>

        <label className="block text-sm">
          <span className="mb-1.5 flex items-center gap-1.5 font-medium text-slate-600">
            <KeyRound size={15} /> Token brapi.dev (ações B3 / FIIs)
          </span>
          <input className={inputCls} value={brapiToken} onChange={(e) => setBrapiToken(e.target.value)} placeholder="cole seu token aqui" />
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-1.5 flex items-center gap-1.5 font-medium text-slate-600">
            <KeyRound size={15} /> Chave Twelve Data (ações EUA)
          </span>
          <input className={inputCls} value={twelveDataKey} onChange={(e) => setTwelveDataKey(e.target.value)} placeholder="cole sua chave aqui" />
        </label>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={salvar}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark"
          >
            <Save size={16} /> Salvar chaves
          </button>
          {salvo && <span className="text-sm font-medium text-success">Salvo! Use “Atualizar” no topo.</span>}
        </div>
      </DashboardCard>

      <DashboardCard title="Dados" subtitle="Tudo é salvo apenas neste navegador">
        <p className="text-sm text-slate-600">
          Sua carteira, metas e doutrina ficam guardadas localmente (localStorage). Resetar volta
          tudo para os dados de exemplo.
        </p>
        <button
          onClick={resetar}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-red-50"
        >
          <RotateCcw size={16} /> Resetar todos os dados
        </button>
      </DashboardCard>
    </div>
  )
}
