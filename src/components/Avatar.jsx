// Avatar circular com iniciais — evita dependência de imagens externas.
function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export default function Avatar({ name, color = '#1687F9', size = 36, className = '' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.38,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
