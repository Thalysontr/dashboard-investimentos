// Wrapper base de card branco, com cabeçalho opcional (título + ação à direita).
// Reutilizado por ChartCard, ActivityCard e TableCard.
export default function DashboardCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = '',
}) {
  return (
    <section
      className={`rounded-2xl border border-line bg-white shadow-card ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
          <div>
            {title && (
              <h3 className="text-base font-bold tracking-tight text-ink">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={`px-5 pb-5 pt-4 sm:px-6 sm:pb-6 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  )
}
