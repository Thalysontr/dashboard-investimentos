import { useEffect, useState } from 'react'

// Estado React persistido automaticamente no localStorage.
export function useLocalState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* ignora quota/erros */
    }
  }, [key, value])

  return [value, setValue]
}

// Limpa todos os dados do app (usado no reset).
export function limparTudo(chaves) {
  chaves.forEach((k) => localStorage.removeItem(k))
}
