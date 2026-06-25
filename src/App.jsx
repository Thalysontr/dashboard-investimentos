import { AppProvider } from './store/store'
import AppLayout from './layout/AppLayout'

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  )
}
