import { useEffect } from 'react'
import { X } from 'lucide-react'

// Modal genérico, centralizado, com backdrop e fechamento por ESC/clique fora.
export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl border border-line bg-white shadow-soft sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-base font-bold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</footer>
        )}
      </div>
    </div>
  )
}
