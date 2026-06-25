import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Wallet, TrendingUp, Coins, DollarSign } from 'lucide-react'
import { useApp } from '../store/store'
import { CORES_CLASSE } from '../lib/calculos'
import { brl, num, dataCurta } from '../lib/formato'
import StatCard from '../components/StatCard'
import DashboardCard from '../components/DashboardCard'

function EvolucaoTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 shadow-soft">
      <p className="text-xs text-muted">{dataCurta(label)}</p>
      <p className="text-sm font-bold text-ink">{brl(payload[0].value)}</p>
    </div>
  )
}

export default function VisaoGeral() {
  const { resumo, carteira, cot, historico } = useApp()

  const dadosPizza = resumo.porClasse.map((c) => ({ name: c.classe, value: c.valor, pct: c.pct }))
  const evolucao = historico.map((h) => ({ ...h }))

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Patrimônio total" value={brl(resumo.total)} icon={Wallet} accent="#1687F9" />
        <StatCard
          label="Lucro / Prejuízo"
          value={brl(resumo.lucro)}
          change={resumo.lucroPct}
          icon={TrendingUp}
          accent={resumo.lucro >= 0 ? '#22C55E' : '#EF4444'}
          hint="no total"
        />
        <StatCard
          label="Ativos na carteira"
          value={num(carteira.length)}
          icon={Coins}
          accent="#8B5CF6"
          hint={`${resumo.porClasse.length} classes`}
        />
        <StatCard
          label="Dólar (USD/BRL)"
          value={brl(cot.cambioUsdBrl)}
          icon={DollarSign}
          accent="#14B8A6"
          hint={cot.atualizadoEm ? `às ${new Date(cot.atualizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'carregando...'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Evolução do patrimônio */}
        <div className="lg:col-span-2">
          <DashboardCard title="Evolução do patrimônio" subtitle="Snapshot diário (cresce a cada dia que você abrir)">
            <div className="h-72 w-full">
              {evolucao.length >= 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolucao} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1687F9" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#1687F9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#EDF1F7" />
                    <XAxis
                      dataKey="data"
                      tickFormatter={(d) => dataCurta(d).slice(0, 6)}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      dy={8}
                    />
                    <YAxis
                      tickFormatter={(v) => `${num(v / 1000)}k`}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      width={44}
                    />
                    <Tooltip content={<EvolucaoTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#1687F9"
                      strokeWidth={2.5}
                      fill="url(#grad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <TrendingUp size={32} className="text-slate-300" />
                  <p className="mt-3 max-w-xs text-sm text-muted">
                    O gráfico de evolução começa hoje e ganha um novo ponto a cada dia que você
                    abrir o dashboard.
                  </p>
                  <p className="mt-2 text-lg font-bold text-ink">{brl(resumo.total)}</p>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Alocação por classe */}
        <DashboardCard title="Alocação por classe" subtitle="Distribuição atual">
          <div className="flex h-44 w-full items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPizza}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  stroke="none"
                >
                  {dadosPizza.map((d) => (
                    <Cell key={d.name} fill={CORES_CLASSE[d.name] || '#CBD5E1'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => brl(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 space-y-2.5">
            {dadosPizza.map((d) => (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: CORES_CLASSE[d.name] || '#CBD5E1' }}
                  />
                  <span className="text-slate-600">{d.name}</span>
                </span>
                <span className="font-semibold text-ink">{num(d.pct, 1)}%</span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </div>
  )
}
