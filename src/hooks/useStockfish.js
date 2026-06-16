import { useCallback, useEffect, useRef, useState } from 'react'

// Difficulty tuning for the three star levels. We combine Stockfish's "Skill
// Level" option (0–20) with a capped search depth and per-move time budget so
// the browser never freezes, even on level 3.
const DIFFICULTY = {
  1: { skill: 1, depth: 5, movetime: 250 }, // 1 star  — quick & weak
  2: { skill: 8, depth: 10, movetime: 700 }, // 2 stars — medium
  3: { skill: 18, depth: 14, movetime: 1200 }, // 3 stars — stronger
}

/**
 * Loads the bundled Stockfish (asm.js) build as a classic Web Worker and exposes
 * a promise-based `getBestMove`. The asm.js build needs no special COOP/COEP
 * headers, so it works on plain static hosts like GitHub Pages.
 *
 * If the engine fails to load, `error` flips to true and the rest of the app can
 * degrade gracefully instead of crashing.
 */
export function useStockfish() {
  const workerRef = useRef(null)
  const pendingRef = useRef(null) // { resolve, reject } for the in-flight `go`
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let worker
    try {
      // BASE_URL is "/chess-game/" in production and "/" in dev, so the worker
      // path stays correct on GitHub Pages.
      const url = `${import.meta.env.BASE_URL}stockfish/stockfish.js`
      worker = new Worker(url)
      workerRef.current = worker

      worker.onmessage = (event) => {
        const line = typeof event.data === 'string' ? event.data : ''
        if (line === 'uciok') setReady(true)

        if (line.startsWith('bestmove')) {
          const best = line.split(/\s+/)[1]
          const pending = pendingRef.current
          pendingRef.current = null
          if (pending) {
            pending.resolve(best && best !== '(none)' ? best : null)
          }
        }
      }

      worker.onerror = () => {
        setError(true)
        const pending = pendingRef.current
        pendingRef.current = null
        if (pending) pending.reject(new Error('Stockfish worker error'))
      }

      worker.postMessage('uci')
      worker.postMessage('isready')
    } catch {
      setError(true)
    }

    return () => {
      if (worker) worker.terminate()
      workerRef.current = null
    }
  }, [])

  // Ask the engine for the best move from a FEN at the given difficulty.
  const getBestMove = useCallback((fen, difficulty) => {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current
      if (!worker) {
        reject(new Error('Stockfish is not available'))
        return
      }
      const cfg = DIFFICULTY[difficulty] || DIFFICULTY[2]
      pendingRef.current = { resolve, reject }
      worker.postMessage(`setoption name Skill Level value ${cfg.skill}`)
      worker.postMessage(`position fen ${fen}`)
      worker.postMessage(`go depth ${cfg.depth} movetime ${cfg.movetime}`)
    })
  }, [])

  return { ready, error, getBestMove }
}
