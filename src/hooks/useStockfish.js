import { useCallback, useEffect, useRef, useState } from 'react'

// Difficulty tuning for the five star levels (1 = easiest, 5 = hardest).
//
// Two knobs work together:
//   - `randomChance` is the probability (handled in App) that the computer just
//     plays a RANDOM legal move instead of consulting the engine. Even at skill 0
//     Stockfish grabs free pieces and avoids blunders, so randomness is what makes
//     the easy levels genuinely beginner-friendly.
//   - `skill` / `depth` / `movetime` tune Stockfish for the non-random moves. The
//     capped depth and per-move time keep the browser responsive, even on level 5.
export const DIFFICULTY = {
  1: { randomChance: 1.0, skill: 0, depth: 1, movetime: 100 }, // ★      — always random (beginner)
  2: { randomChance: 0.55, skill: 0, depth: 2, movetime: 200 }, // ★★     — mostly random, very easy
  3: { randomChance: 0.25, skill: 4, depth: 4, movetime: 450 }, // ★★★    — casual
  4: { randomChance: 0.07, skill: 9, depth: 8, movetime: 700 }, // ★★★★   — intermediate
  5: { randomChance: 0.0, skill: 15, depth: 12, movetime: 1000 }, // ★★★★★  — strong (browser-safe)
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
