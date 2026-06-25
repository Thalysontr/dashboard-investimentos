// Item individual do menu lateral.
// Estado ativo: fundo azul claro + texto/ícone azul escuro.
export default function MenuItem({ icon: Icon, label, active = false, badge = null, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={[
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-brand-light text-brand-dark'
          : 'text-slate-500 hover:bg-slate-50 hover:text-ink',
      ].join(' ')}
    >
      {/* indicador lateral do item ativo */}
      <span
        className={[
          'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />
      <Icon
        size={19}
        strokeWidth={2}
        className={active ? 'text-brand' : 'text-slate-400 group-hover:text-ink'}
      />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span
          className={[
            'rounded-full px-2 py-0.5 text-[11px] font-semibold',
            active ? 'bg-brand text-white' : 'bg-brand-soft text-brand-dark',
          ].join(' ')}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
