import { useState } from 'react'
import { Pencil, Save, X } from 'lucide-react'
import { useApp } from '../store/store'
import DashboardCard from '../components/DashboardCard'

// Renderizador simples: # título, ## subtítulo, - lista, linha vazia = parágrafo.
function DoutrinaView({ texto }) {
  const linhas = texto.split('\n')
  const blocos = []
  let lista = []

  const flushLista = (key) => {
    if (lista.length) {
      blocos.push(
        <ul key={`ul-${key}`} className="my-2 space-y-1.5">
          {lista.map((item, i) => (
            <li key={i} className="flex gap-2 text-[15px] leading-relaxed text-slate-600">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span>{item}</span>
            </li>
          ))}
        </ul>,
      )
      lista = []
    }
  }

  linhas.forEach((linha, i) => {
    const l = linha.trim()
    if (l.startsWith('## ')) {
      flushLista(i)
      blocos.push(
        <h3 key={i} className="mt-6 text-base font-bold text-ink">
          {l.slice(3)}
        </h3>,
      )
    } else if (l.startsWith('# ')) {
      flushLista(i)
      blocos.push(
        <h2 key={i} className="text-xl font-extrabold tracking-tight text-ink">
          {l.slice(2)}
        </h2>,
      )
    } else if (l.startsWith('- ')) {
      lista.push(l.slice(2))
    } else if (l === '') {
      flushLista(i)
    } else {
      flushLista(i)
      blocos.push(
        <p key={i} className="my-2 text-[15px] leading-relaxed text-slate-600">
          {l}
        </p>,
      )
    }
  })
  flushLista('end')
  return <div>{blocos}</div>
}

export default function Doutrina() {
  const { doutrina, setDoutrina } = useApp()
  const [editando, setEditando] = useState(false)
  const [rascunho, setRascunho] = useState(doutrina)

  function salvar() {
    setDoutrina(rascunho)
    setEditando(false)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <DashboardCard
        action={
          editando ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRascunho(doutrina)
                  setEditando(false)
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X size={16} /> Cancelar
              </button>
              <button
                onClick={salvar}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark"
              >
                <Save size={16} /> Salvar
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setRascunho(doutrina)
                setEditando(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Pencil size={16} /> Editar
            </button>
          )
        }
      >
        {editando ? (
          <>
            <textarea
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
              rows={20}
              className="w-full rounded-xl border border-line bg-canvas p-4 font-mono text-sm leading-relaxed text-ink outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
            <p className="mt-2 text-xs text-muted">
              Dica: use <code># </code> para título, <code>## </code> para subtítulo e <code>- </code> para itens de lista.
            </p>
          </>
        ) : (
          <DoutrinaView texto={doutrina} />
        )}
      </DashboardCard>
    </div>
  )
}
