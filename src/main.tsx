import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

const render = () => {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

async function prepare() {
  // Enable MSW in both development and production
  // The service worker will intercept API calls in both environments
  try {
    const { worker } = await import('./mocks/browser')
    await worker.start({ 
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })
  } catch (error) {
    // If MSW fails to start (e.g., service worker not available), continue anyway
    // The API functions have fallback mock data
    console.warn('MSW failed to start, app will use mock data fallback:', error)
  }
  render()
}

prepare()

