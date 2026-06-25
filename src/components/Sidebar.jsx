import { X } from 'lucide-react'
import { navSections } from '../config/navegacao'
import MenuItem from './MenuItem'

// Sidebar fixa no desktop e off-canvas (overlay) no mobile.
export default function Sidebar({ open, onClose, active, onSelect }) {
  return (
    <>
      {/* backdrop no mobile */}
      <div
        onClick={onClose}
        className={[
          'fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        aria-hidden="true"
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-white',
          'transition-transform duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5">
          <a href="#" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-brand">
              <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
                <path
                  d="M7 21l6-7 4 4 8-10"
                  stroke="#fff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-lg font-extrabold tracking-tight text-ink">
              Invest<span className="text-brand">.</span>
            </span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="scrollbar-soft flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-2">
          {navSections.map((section, i) => (
            <div key={i}>
              {section.title && (
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <MenuItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    active={active === item.id}
                    onClick={() => onSelect?.(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Card informativo no rodapé */}
        <div className="px-3 pb-5">
          <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-4 text-white">
            <p className="text-sm font-bold">Cotações ao vivo</p>
            <p className="mt-1 text-xs text-white/80">
              Atualizadas automaticamente 1x ao dia. Adicione suas chaves em Configurações para
              liberar todos os ativos.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
