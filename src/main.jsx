import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// IMPORTANTE: Importa qui il CSS di Mappedin per caricarlo all'avvio


createRoot(document.getElementById('root')).render(
    <App />,
)
