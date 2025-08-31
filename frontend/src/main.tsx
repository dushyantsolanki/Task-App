import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import App from '@/App.tsx'
import { ThemeProvider } from '@/contexts/ThemeProvider.tsx'
import { Toaster } from 'sonner'
import { SocketProvider } from '@/contexts/SocketContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketProvider>
      <ThemeProvider defaultTheme='dark' storageKey="vite-ui-theme">
        <App />
        <Toaster position='bottom-right' expand={true} richColors={true} closeButton={true} />
      </ThemeProvider>
    </SocketProvider>
  </StrictMode>,
)
