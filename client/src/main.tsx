import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import WebSocketProvider from './providers/WebSocketProvider.tsx'
import AssetsProvider from './providers/AssetsProvider.tsx'


ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <WebSocketProvider>
      <AssetsProvider>
        <App />
      </AssetsProvider>
    </WebSocketProvider>
  // </React.StrictMode>,
)
