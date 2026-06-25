import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { titulosPagina } from '../config/navegacao'
import VisaoGeral from '../pages/VisaoGeral'
import Carteira from '../pages/Carteira'
import Rebalanceamento from '../pages/Rebalanceamento'
import Metas from '../pages/Metas'
import Doutrina from '../pages/Doutrina'
import Configuracoes from '../pages/Configuracoes'

const PAGINAS = {
  visao: VisaoGeral,
  carteira: Carteira,
  rebalanceamento: Rebalanceamento,
  metas: Metas,
  doutrina: Doutrina,
  config: Configuracoes,
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pagina, setPagina] = useState('visao')
  const Pagina = PAGINAS[pagina] || VisaoGeral

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active={pagina}
        onSelect={(id) => {
          setPagina(id)
          setSidebarOpen(false)
        }}
      />

      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          breadcrumb={['Investimentos', titulosPagina[pagina]]}
        />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-ink">
            {titulosPagina[pagina]}
          </h1>
          <Pagina />
        </main>
      </div>
    </div>
  )
}
