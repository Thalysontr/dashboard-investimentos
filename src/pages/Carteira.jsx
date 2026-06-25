import { useState } from 'react'
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import { useApp } from '../store/store'
import { CLASSES, CORES_CLASSE } from '../lib/calculos'
import { brl, num, pctSinal } from '../lib/formato'
import DashboardCard from '../components/DashboardCard'
import Modal from '../components/Modal'

const inputCls =
  'w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10'

const vazia = {
  ticker: '',
  nome: '',
  classe: 'Ações BR',
  moeda: 'BRL',
  quantidade: '',
  precoMedio: '',
  idCoingecko: '',
  precoAtualManual: '',
}

function ClasseTag({ classe }) {
  const cor = CORES_CLASSE[classe] || '#CBD5E1'
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${cor}1A`, color: cor }}
    >
      {classe}
    </span>
  )
}

export default function Carteira() {
  const { posicoes, resumo, addPosicao, editPosicao, removePosicao, cot, atualizar } = useApp()
  const [aberto, setAberto] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(vazia)

  function abrirNovo() {
    setEditId(null)
    setForm(vazia)
    setAberto(true)
  }

  function abrirEdicao(p) {
    setEditId(p.id)
    setForm({
      ticker: p.ticker,
      nome: p.nome,
      classe: p.classe,
      moeda: p.moeda,
      quantidade: String(p.quantidade),
      precoMedio: String(p.precoMedio),
      idCoingecko: p.idCoingecko || '',
      precoAtualManual: p.precoAtualManual != null ? String(p.precoAtualManual) : '',
    })
    setAberto(true)
  }

  function salvar() {
    const dados = {
      ticker: form.ticker.trim().toUpperCase(),
      nome: form.nome.trim() || form.ticker.trim().toUpperCase(),
      classe: form.classe,
      moeda: form.moeda,
      quantidade: parseFloat(form.quantidade) || 0,
      precoMedio: parseFloat(form.precoMedio) || 0,
      idCoingecko: form.classe === 'Cripto' ? form.idCoingecko.trim().toLowerCase() : undefined,
      precoAtualManual: form.precoAtualManual ? parseFloat(form.precoAtualManual) : undefined,
    }
    if (!dados.ticker) return
    if (editId) editPosicao(editId, dados)
    else addPosicao(dados)
    setAberto(false)
  }

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  return (
    <div className="space-y-6">
      {/* Resumo + ações */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <p className="text-xs text-muted">Valor de mercado</p>
            <p className="text-lg font-extrabold text-ink">{brl(resumo.total)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Lucro / Prejuízo</p>
            <p className={`text-lg font-extrabold ${resumo.lucro >= 0 ? 'text-success' : 'text-danger'}`}>
              {brl(resumo.lucro)} <span className="text-sm font-semibold">({pctSinal(resumo.lucroPct)})</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => atualizar(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            <RefreshCw size={16} className={cot.carregando ? 'animate-spin' : ''} />
            Atualizar
          </button>
          <button
            onClick={abrirNovo}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark"
          >
            <Plus size={18} strokeWidth={2.5} />
            Adicionar ativo
          </button>
        </div>
      </div>

      <DashboardCard bodyClassName="!px-0 !pt-2">
        <div className="scrollbar-soft overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-line text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 sm:px-6">Ativo</th>
                <th className="px-5 py-3 text-right">Qtd</th>
                <th className="px-5 py-3 text-right">Preço médio</th>
                <th className="px-5 py-3 text-right">Preço atual</th>
                <th className="px-5 py-3 text-right">Valor</th>
                <th className="px-5 py-3 text-right">L/P</th>
                <th className="px-5 py-3 text-right sm:px-6"></th>
              </tr>
            </thead>
            <tbody>
              {posicoes.map((p) => (
                <tr key={p.id} className="border-b border-line/70 transition hover:bg-canvas last:border-0">
                  <td className="px-5 py-3.5 sm:px-6">
                    <div className="font-semibold text-ink">{p.ticker}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted">{p.nome}</span>
                      <ClasseTag classe={p.classe} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">
                    {num(p.quantidade, p.quantidade % 1 === 0 ? 0 : 4)}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-600">
                    {p.moeda === 'USD' ? 'US$ ' : 'R$ '}
                    {num(p.precoMedio, 2)}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums">
                    <span className="text-ink">
                      {p.moeda === 'USD' ? 'US$ ' : 'R$ '}
                      {num(p.precoAtual, 2)}
                    </span>
                    {!p.temCotacao && (
                      <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                        manual
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-ink">
                    {brl(p.valorMercado)}
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums">
                    <div className={`font-semibold ${p.lucro >= 0 ? 'text-success' : 'text-danger'}`}>
                      {brl(p.lucro)}
                    </div>
                    <div className={`text-xs ${p.lucro >= 0 ? 'text-success' : 'text-danger'}`}>
                      {pctSinal(p.lucroPct)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right sm:px-6">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => abrirEdicao(p)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => removePosicao(p.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-danger"
                        aria-label="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posicoes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted">
                    Nenhum ativo ainda. Clique em “Adicionar ativo” para começar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* Modal de cadastro/edição */}
      <Modal
        open={aberto}
        onClose={() => setAberto(false)}
        title={editId ? 'Editar ativo' : 'Adicionar ativo'}
        footer={
          <>
            <button
              onClick={() => setAberto(false)}
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark"
            >
              Salvar
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-1 text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Ticker</span>
            <input className={inputCls} value={form.ticker} onChange={set('ticker')} placeholder="PETR4" />
          </label>
          <label className="col-span-1 text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Nome</span>
            <input className={inputCls} value={form.nome} onChange={set('nome')} placeholder="Petrobras PN" />
          </label>
          <label className="col-span-1 text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Classe</span>
            <select className={inputCls} value={form.classe} onChange={set('classe')}>
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-1 text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Moeda</span>
            <select className={inputCls} value={form.moeda} onChange={set('moeda')}>
              <option value="BRL">BRL (R$)</option>
              <option value="USD">USD (US$)</option>
            </select>
          </label>
          <label className="col-span-1 text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Quantidade</span>
            <input className={inputCls} type="number" step="any" value={form.quantidade} onChange={set('quantidade')} placeholder="100" />
          </label>
          <label className="col-span-1 text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Preço médio</span>
            <input className={inputCls} type="number" step="any" value={form.precoMedio} onChange={set('precoMedio')} placeholder="32.50" />
          </label>
          {form.classe === 'Cripto' && (
            <label className="col-span-2 text-sm">
              <span className="mb-1.5 block font-medium text-slate-600">ID CoinGecko (p/ cotação)</span>
              <input className={inputCls} value={form.idCoingecko} onChange={set('idCoingecko')} placeholder="bitcoin" />
            </label>
          )}
          <label className="col-span-2 text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">
              Preço atual manual <span className="text-muted">(opcional — usado p/ renda fixa ou sem cotação)</span>
            </span>
            <input className={inputCls} type="number" step="any" value={form.precoAtualManual} onChange={set('precoAtualManual')} placeholder="—" />
          </label>
        </div>
      </Modal>
    </div>
  )
}
