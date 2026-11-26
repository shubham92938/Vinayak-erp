import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { applyTheme, getInitialTheme } from './context/theme'
import './styles/variables.css'
import './styles/reset.css'
import './styles/global.css'
import './styles/responsive.css'
import App from './App.jsx'
import './styles/modern.css'

// Apply the saved preference before React mounts so a dark workspace does not
// flash light during the first paint.
applyTheme(getInitialTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
