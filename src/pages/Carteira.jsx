import { useState } from 'react'
import { Plus, Pencil, Trash2, RefreshCw, ShoppingCart } from 'lucide-react'
import { useApp } from '../store/store'
import { CLASSES, CORES_CLASSE } from '../lib/calculos'
import { brl, num, pctSinal, dataCurta } from '../lib/formato'
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
  dataEntrada: '',
  dyEsperado: '',
  precoTeto: '',
  alocacaoAlvo: '',
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

// Barrinha de rentabilidade (verde p/ lucro, vermelho p/ prejuízo).
function BarraRent({ pct }) {
  const largura = Math.min(Math.abs(pct), 100)
  const positivo = pct >= 0
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${positivo ? 'bg-success' : 'bg-danger'}`}
          style={{ width: `${largura}%` }}
        />
      </div>
      <span className={`text-xs font-semibold ${positivo ? 'text-success' : 'text-danger'}`}>
        {pctSinal(pct)}
      </span>
    </div>
  )
}

function ViesPill({ vies }) {
  if (!vies) return <span className="text-xs text-slate-300">—</span>
  const comprar = vies === 'Comprar'
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
        comprar ? 'bg-green-50 text-success' : 'bg-amber-50 text-warning'
      }`}
    >
      {vies}
    </span>
  )
}

export default function Carteira() {
  const { posicoes, resumo, addPosicao, editPosicao, removePosicao, comprarPosicao, cot, atualizar } =
    useApp()
  const [aberto, setAberto] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(vazia)

  // Modal de compra (aporte) com cálculo de preço médio.
  const [compraAberto, setCompraAberto] = useState(false)
  const [compraPos, setCompraPos] = useState(null)
  const [compraForm, setCompraForm] = useState({ quantidade: '', preco: '' })

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
      dataEntrada: p.dataEntrada || '',
      dyEsperado: p.dyEsperado != null ? String(p.dyEsperado) : '',
      precoTeto: p.precoTeto != null ? String(p.precoTeto) : '',
      alocacaoAlvo: p.alocacaoAlvo != null ? String(p.alocacaoAlvo) : '',
      idCoingecko: p.idCoingecko || '',
      precoAtualManual: p.precoAtualManual != null ? String(p.precoAtualManual) : '',
    })
    setAberto(true)
  }

  function salvar() {
    const n = (v) => (v === '' || v == null ? undefined : parseFloat(v))
    const dados = {
      ticker: form.ticker.trim().toUpperCase(),
      nome: form.nome.trim() || form.ticker.trim().toUpperCase(),
      classe: form.classe,
      moeda: form.moeda,
      quantidade: parseFloat(form.quantidade) || 0,
      precoMedio: parseFloat(form.precoMedio) || 0,
      dataEntrada: form.dataEntrada || undefined,
      dyEsperado: n(form.dyEsperado),
      precoTeto: n(form.precoTeto),
      alocacaoAlvo: n(form.alocacaoAlvo),
      idCoingecko: form.classe === 'Cripto' ? form.idCoingecko.trim().toLowerCase() : undefined,
      precoAtualManual: form.precoAtualManual ? parseFloat(form.precoAtualManual) : undefined,
    }
    if (!dados.ticker) return
    if (editId) editPosicao(editId, dados)
    else addPosicao(dados)
    setAberto(false)
  }

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  function abrirCompra(p) {
    setCompraPos(p)
    setCompraForm({ quantidade: '', preco: p.temCotacao ? String(p.precoAtual) : '' })
    setCompraAberto(true)
  }
  function confirmarCompra() {
    const q = parseFloat(compraForm.quantidade) || 0
    const pr = parseFloat(compraForm.preco) || 0
    if (!compraPos || q <= 0 || pr <= 0) return
    comprarPosicao(compraPos.id, q, pr)
    setCompraAberto(false)
  }
  const cq = parseFloat(compraForm.quantidade) || 0
  const cpr = parseFloat(compraForm.preco) || 0
  const novaQtd = compraPos ? compraPos.quantidade + cq : 0
  const novoMedio =
    compraPos && novaQtd > 0
      ? (compraPos.quantidade * compraPos.precoMedio + cq * cpr) / novaQtd
      : compraPos?.precoMedio || 0
  const simb = (m) => (m === 'USD' ? 'US$ ' : 'R$ ')

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
          <table className="w-full min-w-[1080px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-line text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3 text-center sm:px-5">#</th>
                <th className="px-4 py-3 sm:px-5">Ativo</th>
                <th className="px-3 py-3 text-right">DY esp.</th>
                <th className="px-3 py-3 text-right">Entrada</th>
                <th className="px-3 py-3 text-right">Preço atual</th>
                <th className="px-3 py-3 text-right">Preço-teto</th>
                <th className="px-3 py-3 text-right">Alocação</th>
                <th className="px-3 py-3 text-right">Rentab.</th>
                <th className="px-3 py-3 text-center">Viés</th>
                <th className="px-4 py-3 text-right sm:px-5"></th>
              </tr>
            </thead>
            <tbody>
              {posicoes.map((p, i) => (
                <tr key={p.id} className="border-b border-line/70 transition hover:bg-canvas last:border-0">
                  <td className="px-4 py-3 text-center font-bold text-slate-400 sm:px-5">{i + 1}</td>
                  <td className="px-4 py-3 sm:px-5">
                    <div className="font-semibold text-ink">{p.ticker}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted">{p.nome}</span>
                      <ClasseTag classe={p.classe} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                    {p.dyEsperado != null ? `${num(p.dyEsperado, 1)}%` : '—'}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    <div className="text-slate-700">{simb(p.moeda)}{num(p.precoMedio, 2)}</div>
                    {p.dataEntrada && <div className="text-xs text-slate-400">{dataCurta(p.dataEntrada)}</div>}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    <div className="text-ink">
                      {simb(p.moeda)}{num(p.precoAtual, 2)}
                      {!p.temCotacao && (
                        <span className="ml-1 rounded bg-amber-50 px-1 py-0.5 text-[10px] font-semibold text-warning">man.</span>
                      )}
                    </div>
                    {p.variacao != null && (
                      <div className={`text-xs font-medium ${p.variacao >= 0 ? 'text-success' : 'text-danger'}`}>
                        {pctSinal(p.variacao, 2)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                    {p.precoTeto != null ? `${simb(p.moeda)}${num(p.precoTeto, 2)}` : '—'}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                    {p.alocacaoAlvo != null ? `${num(p.alocacaoAlvo, 1)}%` : '—'}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <BarraRent pct={p.lucroPct} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <ViesPill vies={p.vies} />
                  </td>
                  <td className="px-4 py-3 text-right sm:px-5">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => abrirCompra(p)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-soft hover:text-brand" aria-label="Comprar mais" title="Comprar mais (recalcula preço médio)">
                        <ShoppingCart size={16} />
                      </button>
                      <button onClick={() => abrirEdicao(p)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink" aria-label="Editar">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => removePosicao(p.id)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-danger" aria-label="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posicoes.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-muted">
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
            <button onClick={() => setAberto(false)} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Cancelar
            </button>
            <button onClick={salvar} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark">
              Salvar
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Ticker</span>
            <input className={inputCls} value={form.ticker} onChange={set('ticker')} placeholder="WIZC3" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Empresa / Nome</span>
            <input className={inputCls} value={form.nome} onChange={set('nome')} placeholder="WIZ Co" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Classe</span>
            <select className={inputCls} value={form.classe} onChange={set('classe')}>
              {CLASSES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Moeda</span>
            <select className={inputCls} value={form.moeda} onChange={set('moeda')}>
              <option value="BRL">BRL (R$)</option>
              <option value="USD">USD (US$)</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Quantidade</span>
            <input className={inputCls} type="number" step="any" value={form.quantidade} onChange={set('quantidade')} placeholder="100" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Preço médio (entrada)</span>
            <input className={inputCls} type="number" step="any" value={form.precoMedio} onChange={set('precoMedio')} placeholder="7.56" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Data de entrada</span>
            <input className={inputCls} type="date" value={form.dataEntrada} onChange={set('dataEntrada')} />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">DY esperado (%)</span>
            <input className={inputCls} type="number" step="any" value={form.dyEsperado} onChange={set('dyEsperado')} placeholder="10.3" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Preço-teto</span>
            <input className={inputCls} type="number" step="any" value={form.precoTeto} onChange={set('precoTeto')} placeholder="10.00" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Alocação-alvo (%)</span>
            <input className={inputCls} type="number" step="any" value={form.alocacaoAlvo} onChange={set('alocacaoAlvo')} placeholder="10" />
          </label>
          {form.classe === 'Cripto' && (
            <label className="col-span-2 text-sm">
              <span className="mb-1.5 block font-medium text-slate-600">ID CoinGecko (p/ cotação)</span>
              <input className={inputCls} value={form.idCoingecko} onChange={set('idCoingecko')} placeholder="bitcoin" />
            </label>
          )}
          <label className="col-span-2 text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">
              Preço atual manual <span className="text-muted">(opcional — p/ renda fixa ou sem cotação)</span>
            </span>
            <input className={inputCls} type="number" step="any" value={form.precoAtualManual} onChange={set('precoAtualManual')} placeholder="—" />
          </label>
        </div>
      </Modal>

      {/* Modal de compra (aporte) */}
      <Modal
        open={compraAberto}
        onClose={() => setCompraAberto(false)}
        title={compraPos ? `Comprar ${compraPos.ticker}` : 'Comprar'}
        footer={
          <>
            <button onClick={() => setCompraAberto(false)} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Cancelar
            </button>
            <button onClick={confirmarCompra} disabled={cq <= 0 || cpr <= 0} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40">
              Confirmar compra
            </button>
          </>
        }
      >
        {compraPos && (
          <div className="space-y-4">
            <div className="rounded-xl bg-canvas p-3 text-sm">
              <p className="text-muted">
                Posição atual: <span className="font-semibold text-ink">{num(compraPos.quantidade, compraPos.quantidade % 1 === 0 ? 0 : 4)}</span> un. ·
                preço médio <span className="font-semibold text-ink">{simb(compraPos.moeda)}{num(compraPos.precoMedio, 2)}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-slate-600">Quantidade comprada</span>
                <input className={inputCls} type="number" step="any" autoFocus value={compraForm.quantidade} onChange={(e) => setCompraForm((f) => ({ ...f, quantidade: e.target.value }))} placeholder="5" />
              </label>
              <label className="text-sm">
                <span className="mb-1.5 block font-medium text-slate-600">Preço unitário pago</span>
                <input className={inputCls} type="number" step="any" value={compraForm.preco} onChange={(e) => setCompraForm((f) => ({ ...f, preco: e.target.value }))} placeholder="7.88" />
              </label>
            </div>
            <div className="rounded-xl border border-brand/20 bg-brand-soft p-4">
              <p className="text-xs font-medium text-brand-dark/70">Depois da compra</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Nova quantidade</span>
                <span className="font-bold text-ink">{num(novaQtd, novaQtd % 1 === 0 ? 0 : 4)} un.</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Novo preço médio</span>
                <span className="font-bold text-ink">{simb(compraPos.moeda)}{num(novoMedio, 2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
