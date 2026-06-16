import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import './styles/buttons.css'
import './styles/board.css'
import './styles/screens.css'

// Note: we deliberately do not wrap in <StrictMode> — its double-invoking of
// effects in development would spin up the Stockfish worker twice and make the
// AI-move effect harder to reason about. Production behaviour is identical.
createRoot(document.getElementById('root')).render(<App />)
