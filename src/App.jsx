import { Loader2 } from 'lucide-react'
import { AppProvider, useApp } from './store/store'
import { supabaseConfigurado } from './lib/supabase'
import AppLayout from './layout/AppLayout'
import Login from './components/Login'

function Gate() {
  const { authLoading, session } = useApp()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Loader2 size={28} className="animate-spin text-brand" />
      </div>
    )
  }

  // Com Supabase configurado, exige login. Sem config, roda local (sem login).
  if (supabaseConfigurado && !session) return <Login />

  return <AppLayout />
}

export default function App() {
  return (
    <AppProvider>
      <Gate />
    </AppProvider>
  )
}
