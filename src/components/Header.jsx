import { Menu, Bell, RefreshCw, ChevronRight } from 'lucide-react'
import UserProfileMenu from './UserProfileMenu'
import { useApp } from '../store/store'

// Header superior minimalista e responsivo.
export default function Header({ onMenuClick, breadcrumb = ['Investimentos', 'Visão Geral'] }) {
  const { cot, atualizar } = useApp()

  const hora = cot.atualizadoEm
    ? new Date(cot.atualizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        {/* Esquerda: toggle (mobile) + breadcrumb */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-ink lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>

          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumb.map((crumb, i) => {
              const last = i === breadcrumb.length - 1
              return (
                <span key={crumb} className="flex items-center gap-1.5">
                  <span className={last ? 'font-semibold text-ink' : 'hidden text-muted sm:inline'}>
                    {crumb}
                  </span>
                  {!last && <ChevronRight size={15} className="hidden text-slate-300 sm:block" />}
                </span>
              )
            })}
          </nav>
        </div>

        {/* Direita: atualizar + notificações + perfil */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => atualizar(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-dark sm:px-4"
          >
            <RefreshCw size={16} className={cot.carregando ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{cot.carregando ? 'Atualizando...' : 'Atualizar'}</span>
          </button>

          {hora && (
            <span className="hidden text-xs text-muted lg:inline">
              Atualizado às {hora}
            </span>
          )}

          <button
            type="button"
            className="relative rounded-xl border border-line bg-white p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-ink"
            aria-label="Notificações"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />
          </button>

          <UserProfileMenu />
        </div>
      </div>
    </header>
  )
}
