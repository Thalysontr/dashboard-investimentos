import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { pctSinal } from '../lib/formato'

// Cartão de KPI: rótulo, valor em destaque, ícone e variação opcional.
export default function StatCard({ label, value, change, icon: Icon, accent = '#1687F9', hint }) {
  const up = (change ?? 0) >= 0
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        {Icon && (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accent}1A`, color: accent }}
          >
            <Icon size={18} />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-ink">{value}</p>
      {change != null && (
        <p className="mt-1 flex items-center gap-1 text-sm">
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              up ? 'text-success' : 'text-danger'
            }`}
          >
            {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
            {pctSinal(change)}
          </span>
          {hint && <span className="text-muted">{hint}</span>}
        </p>
      )}
      {change == null && hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  )
}
