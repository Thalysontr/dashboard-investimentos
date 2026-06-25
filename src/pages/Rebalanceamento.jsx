import { useState } from 'react'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { useApp } from '../store/store'
import { CLASSES, CORES_CLASSE, calcularRebalanceamento } from '../lib/calculos'
import { brl, num } from '../lib/formato'
import DashboardCard from '../components/DashboardCard'

const inputCls =
  'w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10'

// Selo de ação (comprar / vender / manter).
function AcaoPill({ ajuste }) {
  const comprar = ajuste > 1
  const vender = ajuste < -1
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        comprar
          ? 'bg-green-50 text-success'
          : vender
            ? 'bg-red-50 text-danger'
            : 'bg-slate-100 text-slate-500'
      }`}
    >
      {comprar ? <ArrowUp size={13} /> : vender ? <ArrowDown size={13} /> : <Minus size={13} />}
      {comprar ? 'Comprar ' : vender ? 'Vender ' : 'Manter'}
      {comprar || vender ? brl(Math.abs(ajuste)) : ''}
    </span>
  )
}

export default function Rebalanceamento() {
  const { posicoes, resumo, alvo, setAlvo, alvoAtivos, setAlvoAtivo } = useApp()
  const [aporte, setAporte] = useState('')

  const aporteNum = parseFloat(aporte) || 0
  const grupos = calcularRebalanceamento(posicoes, alvo, alvoAtivos, resumo.total, aporteNum)
  const somaAlvoClasses = CLASSES.reduce((s, c) => s + (Number(alvo[c]) || 0), 0)

  const setAlvoClasse = (classe) => (e) =>
    setAlvo((a) => ({ ...a, [classe]: parseFloat(e.target.value) || 0 }))

  return (
    <div className="space-y-6">
      {/* Controles: aporte + alvo por classe */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard title="Simular aporte" subtitle="Distribui um novo investimento" className="lg:col-span-1">
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Valor do aporte (R$)</span>
            <input
              className={inputCls}
              type="number"
              step="any"
              value={aporte}
              onChange={(e) => setAporte(e.target.value)}
              placeholder="3000"
            />
          </label>
          <div className="mt-4 rounded-xl bg-brand-soft p-4">
            <p className="text-xs text-brand-dark/70">Patrimônio após o aporte</p>
            <p className="text-xl font-extrabold text-ink">{brl(resumo.total + aporteNum)}</p>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Alvo por classe"
          subtitle="Nível 1: o peso de cada grupo na carteira"
          className="lg:col-span-2"
          action={
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                somaAlvoClasses === 100 ? 'bg-green-50 text-success' : 'bg-amber-50 text-warning'
              }`}
            >
              Soma: {num(somaAlvoClasses)}%
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {CLASSES.map((c) => (
              <label key={c} className="text-sm">
                <span className="mb-1.5 flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CORES_CLASSE[c] }} />
                  {c}
                </span>
                <div className="relative">
                  <input
                    className={inputCls + ' pr-7'}
                    type="number"
                    step="any"
                    value={alvo[c] ?? 0}
                    onChange={setAlvoClasse(c)}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
                </div>
              </label>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Nível 2: plano detalhado por ativo, dentro de cada classe */}
      <div>
        <h2 className="mb-1 text-base font-bold text-ink">Plano por ativo</h2>
        <p className="mb-4 text-sm text-muted">
          Nível 2: defina o peso de cada ativo <strong>dentro</strong> do grupo (some 100% por
          classe). A coluna “% do total” mostra o peso efetivo na carteira inteira.
        </p>

        <div className="space-y-5">
          {grupos.map((g) => {
            const somaOk = Math.round(g.somaDentro) === 100
            return (
              <DashboardCard
                key={g.classe}
                title={
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CORES_CLASSE[g.classe] }} />
                    {g.classe}
                  </span>
                }
                subtitle={`Atual ${num(g.atualPctClasse, 1)}% · Alvo ${num(g.alvoPctClasse, 1)}% · ${brl(g.atualValorClasse)} → ${brl(g.alvoValorClasse)}`}
                action={
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        somaOk ? 'bg-green-50 text-success' : 'bg-amber-50 text-warning'
                      }`}
                    >
                      Soma ativos: {num(g.somaDentro)}%
                    </span>
                    <AcaoPill ajuste={g.ajusteClasse} />
                  </div>
                }
                bodyClassName="!px-0 !pt-2"
              >
                <div className="scrollbar-soft overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-sm">
                    <thead>
                      <tr className="border-y border-line text-left text-xs font-semibold uppercase tracking-wide text-muted">
                        <th className="px-5 py-2.5 sm:px-6">Ativo</th>
                        <th className="px-5 py-2.5 text-right">% no grupo</th>
                        <th className="px-5 py-2.5 text-right">% do total</th>
                        <th className="px-5 py-2.5 text-right">Atual</th>
                        <th className="px-5 py-2.5 text-right">Alvo</th>
                        <th className="px-5 py-2.5 text-right sm:px-6">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.ativos.map((a) => (
                        <tr key={a.id} className="border-b border-line/70 last:border-0">
                          <td className="px-5 py-3 sm:px-6">
                            <div className="font-semibold text-ink">{a.ticker}</div>
                            <div className="text-xs text-muted">{a.nome}</div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="relative ml-auto w-24">
                              <input
                                className={
                                  'w-full rounded-lg border bg-canvas px-2 py-1.5 pr-6 text-right text-sm text-ink outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10 ' +
                                  (a.ehPadrao ? 'border-dashed border-slate-300 text-muted' : 'border-line')
                                }
                                type="number"
                                step="any"
                                value={a.ehPadrao ? '' : a.pctDentro}
                                placeholder={num(a.pctDentro, 0)}
                                onChange={(e) => setAlvoAtivo(a.id, parseFloat(e.target.value) || 0)}
                              />
                              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-slate-500">
                            {num(a.pctTotalEfetivo, 1)}%
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-slate-600">{brl(a.atualValor)}</td>
                          <td className="px-5 py-3 text-right tabular-nums text-slate-600">{brl(a.alvoValor)}</td>
                          <td className="px-5 py-3 text-right sm:px-6">
                            <AcaoPill ajuste={a.ajuste} />
                          </td>
                        </tr>
                      ))}
                      {g.ativos.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-6 text-center text-sm text-muted">
                            Nenhum ativo desta classe na carteira.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
