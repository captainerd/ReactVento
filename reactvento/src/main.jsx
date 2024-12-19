import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.PUBLIC_KEY = "a9b2c7d5e1f4g8h3i0j112112466n7o8p0q4r73473610x1y2z3a4b5c6d7e8f9g0h18776678l5m6n7o";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
