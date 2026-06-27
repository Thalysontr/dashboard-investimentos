import { useState } from 'react'
import { ArrowUp, ArrowDown, Minus, Wallet, Target, PlusCircle } from 'lucide-react'
import { useApp } from '../store/store'
import { CORES_CLASSE } from '../lib/calculos'
import { brl, num } from '../lib/formato'
import DashboardCard from '../components/DashboardCard'
import StatCard from '../components/StatCard'

const inputCls =
  'w-full rounded-lg border bg-canvas px-2 py-1.5 pr-6 text-right text-sm text-ink outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10'

function AcaoPill({ ajuste, novo }) {
  const comprar = ajuste > 1
  const vender = ajuste < -1
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        comprar ? 'bg-green-50 text-success' : vender ? 'bg-red-50 text-danger' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {comprar ? <ArrowUp size={13} /> : vender ? <ArrowDown size={13} /> : <Minus size={13} />}
      {comprar ? (novo ? 'Alocar ' : 'Comprar ') : vender ? 'Vender ' : 'Manter'}
      {comprar || vender ? brl(Math.abs(ajuste)) : ''}
    </span>
  )
}

export default function Rebalanceamento() {
  const { posicoes, resumo, editPosicao } = useApp()
  const [aporte, setAporte] = useState('')
  const aporteNum = parseFloat(aporte) || 0
  const total = resumo.total
  const totalFinal = total + aporteNum

  // Carteira recomendada = ativos com alocação-alvo definida.
  const recomendados = posicoes
    .filter((p) => p.alocacaoAlvo > 0)
    .map((p) => {
      const atualValor = p.valorMercado
      const atualPct = total > 0 ? (atualValor / total) * 100 : 0
      const alvoValor = (totalFinal * p.alocacaoAlvo) / 100
      const ajuste = alvoValor - atualValor
      const faltaAlocar = p.quantidade <= 0
      return { ...p, atualValor, atualPct, alvoValor, ajuste, faltaAlocar }
    })
    .sort((a, b) => b.alocacaoAlvo - a.alocacaoAlvo)

  const somaAlvo = recomendados.reduce((s, p) => s + (p.alocacaoAlvo || 0), 0)
  const faltam = recomendados.filter((p) => p.faltaAlocar)
  const semAlvo = posicoes.filter((p) => p.quantidade > 0 && !(p.alocacaoAlvo > 0)).length

  const setAlvo = (id) => (e) => editPosicao(id, { alocacaoAlvo: parseFloat(e.target.value) || 0 })

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Patrimônio (com aporte)" value={brl(totalFinal)} icon={Wallet} accent="#1687F9" />
        <StatCard
          label="Soma das alocações-alvo"
          value={`${num(somaAlvo, 1)}%`}
          icon={Target}
          accent={Math.round(somaAlvo) === 100 ? '#22C55E' : '#F59E0B'}
          hint={Math.round(somaAlvo) === 100 ? 'fechou 100%' : 'ideal: 100%'}
        />
        <StatCard
          label="Ativos a alocar"
          value={num(faltam.length)}
          icon={PlusCircle}
          accent="#8B5CF6"
          hint="recomendados que você não tem"
        />
      </div>

      {/* Simular aporte */}
      <DashboardCard title="Simular aporte" subtitle="Distribui um novo investimento pelos alvos">
        <label className="block max-w-xs text-sm">
          <span className="mb-1.5 block font-medium text-slate-600">Valor do aporte (R$)</span>
          <input
            className="w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
            type="number"
            step="any"
            value={aporte}
            onChange={(e) => setAporte(e.target.value)}
            placeholder="3000"
          />
        </label>
      </DashboardCard>

      {/* Falta alocar (não comprados) */}
      {faltam.length > 0 && (
        <DashboardCard title="Falta alocar" subtitle="Ativos da carteira recomendada que você ainda não tem">
          <div className="flex flex-wrap gap-2">
            {faltam.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-2 rounded-xl border border-brand/20 bg-brand-soft px-3 py-2 text-sm">
                <span className="font-semibold text-ink">{p.ticker}</span>
                <span className="text-muted">{num(p.alocacaoAlvo, 1)}%</span>
                <span className="font-semibold text-brand-dark">→ {brl(p.alvoValor)}</span>
              </span>
            ))}
          </div>
        </DashboardCard>
      )}

      {/* Plano de rebalanceamento por ativo */}
      <DashboardCard
        title="Plano de rebalanceamento"
        subtitle="Alocação atual × alvo, por ativo"
        bodyClassName="!px-0 !pt-2"
        action={
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${Math.round(somaAlvo) === 100 ? 'bg-green-50 text-success' : 'bg-amber-50 text-warning'}`}>
            Soma: {num(somaAlvo, 1)}%
          </span>
        }
      >
        <div className="scrollbar-soft overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-line text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 sm:px-6">Ativo</th>
                <th className="px-3 py-3 text-right">% Atual</th>
                <th className="px-3 py-3 text-right">% Alvo</th>
                <th className="px-3 py-3 text-right">Valor atual</th>
                <th className="px-3 py-3 text-right">Valor alvo</th>
                <th className="px-3 py-3 text-right sm:px-6">Ação</th>
              </tr>
            </thead>
            <tbody>
              {recomendados.map((p) => (
                <tr key={p.id} className="border-b border-line/70 transition hover:bg-canvas last:border-0">
                  <td className="px-5 py-3 sm:px-6">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CORES_CLASSE[p.classe] || '#CBD5E1' }} />
                      <span className="font-semibold text-ink">{p.ticker}</span>
                      {p.faltaAlocar && (
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-dark">FALTA ALOCAR</span>
                      )}
                    </div>
                    <div className="ml-[18px] mt-0.5 text-xs text-muted">{p.nome}</div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">{num(p.atualPct, 1)}%</td>
                  <td className="px-3 py-3 text-right">
                    <div className="relative ml-auto w-20">
                      <input className={inputCls + ' border-line'} type="number" step="any" value={p.alocacaoAlvo} onChange={setAlvo(p.id)} />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">{brl(p.atualValor)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">{brl(p.alvoValor)}</td>
                  <td className="px-3 py-3 text-right sm:px-6">
                    <AcaoPill ajuste={p.ajuste} novo={p.faltaAlocar} />
                  </td>
                </tr>
              ))}
              {recomendados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted">
                    Nenhum ativo com alocação-alvo. Defina a “Alocação-alvo (%)” nos ativos (em Minha
                    Carteira) para montar a carteira recomendada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {semAlvo > 0 && (
          <p className="px-5 pt-3 text-xs text-muted sm:px-6">
            {semAlvo} ativo(s) que você tem ainda não têm alocação-alvo definida — defina em Minha Carteira para incluí-los aqui.
          </p>
        )}
      </DashboardCard>
    </div>
  )
}
