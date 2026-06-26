import { useState, useRef } from 'react'
import { Save, RotateCcw, KeyRound, Info, Timer, Download, Upload } from 'lucide-react'
import { getConfigApis, setConfigApis, CHAVES_STORAGE } from '../services/cotacoes'
import { limparTudo } from '../lib/armazenamento'
import { useApp } from '../store/store'
import DashboardCard from '../components/DashboardCard'

const OPCOES_INTERVALO = [5, 15, 30, 60]

// Chaves incluídas no backup (dados do usuário; sem cache nem chaves de API).
const CHAVES_BACKUP = [
  'carteira_v1',
  'alvo_v1',
  'alvoAtivos_v1',
  'metas_v1',
  'doutrina_v1',
  'intervaloMin_v1',
]

const inputCls =
  'w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10'

export default function Configuracoes() {
  const { intervaloMin, setIntervaloMin, atualizar, pushNow } = useApp()
  const cfg = getConfigApis()
  const [brapiToken, setBrapiToken] = useState(cfg.brapiToken || '')
  const [twelveDataKey, setTwelveDataKey] = useState(cfg.twelveDataKey || '')
  const [salvo, setSalvo] = useState(false)

  // Salva automaticamente assim que o usuário digita/cola (sem depender de botão).
  function onBrapi(e) {
    const v = e.target.value
    setBrapiToken(v)
    setConfigApis({ brapiToken: v.trim(), twelveDataKey: twelveDataKey.trim() })
  }
  function onTwelve(e) {
    const v = e.target.value
    setTwelveDataKey(v)
    setConfigApis({ brapiToken: brapiToken.trim(), twelveDataKey: v.trim() })
  }

  async function salvarEAtualizar() {
    setConfigApis({ brapiToken: brapiToken.trim(), twelveDataKey: twelveDataKey.trim() })
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
    pushNow?.() // sincroniza as chaves com a nuvem
    await atualizar(true)
  }

  function resetar() {
    if (confirm('Isso apaga sua carteira, metas, doutrina e configurações deste navegador. Continuar?')) {
      limparTudo(CHAVES_STORAGE)
      location.reload()
    }
  }

  const fileRef = useRef(null)

  function exportar() {
    const dados = {}
    CHAVES_BACKUP.forEach((k) => {
      const v = localStorage.getItem(k)
      if (v != null) {
        try {
          dados[k] = JSON.parse(v)
        } catch {
          /* ignora */
        }
      }
    })
    const conteudo = JSON.stringify(
      { app: 'dashboard-investimentos', exportadoEm: new Date().toISOString(), dados },
      null,
      2,
    )
    const blob = new Blob([conteudo], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `carteira-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        const dados = parsed.dados || parsed
        Object.entries(dados).forEach(([k, v]) => {
          if (CHAVES_BACKUP.includes(k)) localStorage.setItem(k, JSON.stringify(v))
        })
        alert('Backup restaurado com sucesso!')
        location.reload()
      } catch {
        alert('Arquivo de backup inválido.')
      }
    }
    reader.readAsText(file)
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
          <input className={inputCls} value={brapiToken} onChange={onBrapi} placeholder="cole seu token aqui" />
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-1.5 flex items-center gap-1.5 font-medium text-slate-600">
            <KeyRound size={15} /> Chave Twelve Data (ações EUA)
          </span>
          <input className={inputCls} value={twelveDataKey} onChange={onTwelve} placeholder="cole sua chave aqui" />
        </label>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={salvarEAtualizar}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark"
          >
            <Save size={16} /> Salvar e atualizar cotações
          </button>
          {salvo && <span className="text-sm font-medium text-success">Salvo! Atualizando...</span>}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Backup e restauração"
        subtitle="Salve seus dados num arquivo ou recupere em outro dispositivo"
      >
        <div className="mb-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>
            Seus dados ficam <strong>só neste navegador</strong>. Faça backup de vez em quando para
            não perder se limpar o navegador — e use o arquivo para abrir a carteira em outro
            dispositivo.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportar}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark"
          >
            <Download size={16} /> Baixar backup (.json)
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Upload size={16} /> Restaurar backup
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importar} />
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
