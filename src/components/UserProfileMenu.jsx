import { useEffect, useRef, useState } from 'react'
import { ChevronDown, User, Settings, LifeBuoy, LogOut } from 'lucide-react'
import Avatar from './Avatar'
import { currentUser } from '../config/usuario'
import { useApp } from '../store/store'

const menu = [
  { label: 'Meu perfil', icon: User },
  { label: 'Configurações', icon: Settings },
  { label: 'Suporte', icon: LifeBuoy },
]

export default function UserProfileMenu() {
  const { session, signOut, sincronizando } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const email = session?.user?.email || currentUser.email
  const nome = email ? email.split('@')[0] : currentUser.name

  // Fecha ao clicar fora.
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={nome} color={currentUser.color} size={34} />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-[140px] truncate text-sm font-semibold text-ink">{nome}</span>
          <span className="block text-xs text-muted">
            {sincronizando ? 'Salvando...' : 'Investidor'}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`hidden text-muted transition-transform sm:block ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 origin-top-right rounded-2xl border border-line bg-white p-2 shadow-soft"
        >
          <div className="flex items-center gap-3 rounded-xl bg-canvas px-3 py-3">
            <Avatar name={nome} color={currentUser.color} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{nome}</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </div>
          <div className="my-1.5 h-px bg-line" />
          {menu.map(({ label, icon: Icon }) => (
            <button
              key={label}
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-ink"
            >
              <Icon size={17} className="text-slate-400" />
              {label}
            </button>
          ))}
          <div className="my-1.5 h-px bg-line" />
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false)
              signOut?.()
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-danger transition hover:bg-red-50"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
