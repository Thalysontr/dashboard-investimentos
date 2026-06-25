import {
  LayoutDashboard,
  Wallet,
  Scale,
  Target,
  BookOpen,
  Settings,
} from 'lucide-react'

// Itens do menu lateral = páginas do app.
export const navSections = [
  {
    title: null,
    items: [
      { id: 'visao', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'carteira', label: 'Minha Carteira', icon: Wallet },
      { id: 'rebalanceamento', label: 'Rebalanceamento', icon: Scale },
    ],
  },
  {
    title: 'Planejamento',
    items: [
      { id: 'metas', label: 'Metas', icon: Target },
      { id: 'doutrina', label: 'Doutrina', icon: BookOpen },
    ],
  },
  {
    title: 'Sistema',
    items: [{ id: 'config', label: 'Configurações', icon: Settings }],
  },
]

// Título/breadcrumb por página.
export const titulosPagina = {
  visao: 'Visão Geral',
  carteira: 'Minha Carteira',
  rebalanceamento: 'Rebalanceamento',
  metas: 'Metas',
  doutrina: 'Doutrina',
  config: 'Configurações',
}
