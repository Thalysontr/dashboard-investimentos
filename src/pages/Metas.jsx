import { useState } from 'react'
import { Plus, Trash2, Target, CheckCircle2 } from 'lucide-react'
import { useApp } from '../store/store'
import { CLASSES, progressoMeta } from '../lib/calculos'
import { brl, num, dataCurta } from '../lib/formato'
import DashboardCard from '../components/DashboardCard'
import Modal from '../components/Modal'

const inputCls =
  'w-full rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10'

const vazia = { titulo: '', tipo: 'patrimonio', alvo: '', atual: '', classe: 'Ações BR', prazo: '' }

const rotuloTipo = {
  patrimonio: 'Patrimônio total',
  valor: 'Valor (manual)',
  classe: '% de uma classe',
}

export default function Metas() {
  const { metas, addMeta, removeMeta, resumo } = useApp()
  const [aberto, setAberto] = useState(false)
  const [form, setForm] = useState(vazia)
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  function salvar() {
    if (!form.titulo.trim()) return
    addMeta({
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      alvo: parseFloat(form.alvo) || 0,
      atual: form.tipo === 'valor' ? parseFloat(form.atual) || 0 : undefined,
      classe: form.tipo === 'classe' ? form.classe : undefined,
      prazo: form.prazo || undefined,
    })
    setForm(vazia)
    setAberto(false)
  }

  const formatar = (meta, v) =>
    meta.tipo === 'classe' ? `${num(v, 1)}%` : brl(v)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Acompanhe o progresso em direção aos seus objetivos.</p>
        <button
          onClick={() => setAberto(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark"
        >
          <Plus size={18} strokeWidth={2.5} />
          Nova meta
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {metas.map((meta) => {
          const { atual, alvo, pct } = progressoMeta(meta, resumo)
          const concluida = pct >= 100
          return (
            <DashboardCard key={meta.id}>
              <div className="flex items-start justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    concluida ? 'bg-green-50 text-success' : 'bg-brand-soft text-brand'
                  }`}
                >
                  {concluida ? <CheckCircle2 size={20} /> : <Target size={20} />}
                </span>
                <button
                  onClick={() => removeMeta(meta.id)}
                  className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-danger"
                  aria-label="Excluir meta"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <h3 className="mt-4 text-base font-bold text-ink">{meta.titulo}</h3>
              <p className="mt-0.5 text-xs text-muted">
                {rotuloTipo[meta.tipo]}
                {meta.classe ? ` · ${meta.classe}` : ''}
                {meta.prazo ? ` · até ${dataCurta(meta.prazo)}` : ''}
              </p>

              <div className="mt-4 flex items-end justify-between">
                <span className="text-lg font-extrabold text-ink">{formatar(meta, atual)}</span>
                <span className="text-sm text-muted">de {formatar(meta, alvo)}</span>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${concluida ? 'bg-success' : 'bg-brand'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-xs font-semibold text-slate-500">{num(pct, 0)}%</p>
            </DashboardCard>
          )
        })}

        {metas.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-line py-12 text-center text-sm text-muted">
            Nenhuma meta ainda. Crie sua primeira em “Nova meta”.
          </div>
        )}
      </div>

      <Modal
        open={aberto}
        onClose={() => setAberto(false)}
        title="Nova meta"
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
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Título</span>
            <input className={inputCls} value={form.titulo} onChange={set('titulo')} placeholder="Primeiro R$ 1 milhão" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Tipo</span>
            <select className={inputCls} value={form.tipo} onChange={set('tipo')}>
              <option value="patrimonio">Patrimônio total (automático)</option>
              <option value="valor">Valor específico (manual)</option>
              <option value="classe">% de uma classe (automático)</option>
            </select>
          </label>
          {form.tipo === 'classe' && (
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-600">Classe</span>
              <select className={inputCls} value={form.classe} onChange={set('classe')}>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-600">
                Alvo {form.tipo === 'classe' ? '(%)' : '(R$)'}
              </span>
              <input className={inputCls} type="number" step="any" value={form.alvo} onChange={set('alvo')} />
            </label>
            {form.tipo === 'valor' && (
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-600">Valor atual (R$)</span>
                <input className={inputCls} type="number" step="any" value={form.atual} onChange={set('atual')} />
              </label>
            )}
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-600">Prazo</span>
              <input className={inputCls} type="date" value={form.prazo} onChange={set('prazo')} />
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
