import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import AppRoutes from '@/routes/AppRoutes'
import { ManagerLocaleProvider } from '@/contexts/ManagerLocaleContext'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ManagerLocaleProvider>
          <AppRoutes />
        </ManagerLocaleProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
