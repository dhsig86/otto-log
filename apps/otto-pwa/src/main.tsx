import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

// Service worker registration via vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register'

registerSW({
  onNeedRefresh() {
    // TODO: mostrar toast de atualização disponível
    console.warn('[SW] Nova versão disponível. Recarregue para atualizar.')
  },
  onOfflineReady() {
    console.warn('[SW] OTTO pronto para uso offline.')
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
