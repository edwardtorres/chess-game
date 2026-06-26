import { useCallback, useRef, useState } from 'react'
import { Chess } from 'chess.js'

// Inspect the chess.js instance and describe how (if at all) the game has ended.
function detectResult(game) {
  if (game.isCheckmate()) {
    // The side to move has been mated, so the *other* side wins.
    return { type: 'checkmate', winner: game.turn() === 'w' ? 'b' : 'w' }
  }
  if (game.isStalemate()) {
    return { type: 'stalemate', winner: null }
  }
  if (game.isInsufficientMaterial()) {
    return { type: 'draw', winner: null, reason: 'insufficient material' }
  }
  if (game.isThreefoldRepetition()) {
    return { type: 'draw', winner: null, reason: 'threefold repetition' }
  }
  if (game.isDraw()) {
    return { type: 'draw', winner: null, reason: 'fifty-move rule' }
  }
  return null
}

/**
 * Owns a single chess.js game and exposes everything the UI needs to render the
 * board and handle click-to-move interaction, promotion, undo and resignation.
 *
 * chess.js itself is mutable, so we keep it in a ref and bump a version counter
 * to trigger re-renders after each change.
 */
export function useChessGame() {
  const gameRef = useRef(new Chess())
  const game = gameRef.current

  const [, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((v) => v + 1), [])

  const [selected, setSelected] = useState(null)
  const [lastMove, setLastMove] = useState(null) // { from, to }
  const [pendingPromotion, setPendingPromotion] = useState(null) // { from, to }
  const [result, setResult] = useState(null) // { type, winner, reason? }

  // ----- Derived values (recomputed every render from the live instance) -----
  const board = game.board()
  const turn = game.turn()
  const inCheck = game.inCheck()

  let checkSquare = null
  if (inCheck) {
    for (const row of board) {
      for (const sq of row) {
        if (sq && sq.type === 'k' && sq.color === turn) checkSquare = sq.square
      }
    }
  }

  // For the currently selected piece, map every legal destination square to a
  // little descriptor so squares can render dots / capture rings.
  const legalTargets = {}
  if (selected && !result) {
    for (const m of game.moves({ square: selected, verbose: true })) {
      legalTargets[m.to] = {
        capture: m.flags.includes('c') || m.flags.includes('e'),
        promotion: m.flags.includes('p'),
      }
    }
  }

  // ----- Mutators -----
  const finishMove = useCallback(
    (moveObj) => {
      setLastMove({ from: moveObj.from, to: moveObj.to })
      setSelected(null)
      setPendingPromotion(null)
      const r = detectResult(game)
      if (r) setResult(r)
      bump()
    },
    [game, bump],
  )

  const applyMove = useCallback(
    (from, to, promotion) => {
      try {
        const move = game.move({ from, to, promotion })
        if (move) {
          finishMove(move)
          return true
        }
      } catch {
        // chess.js throws on an illegal move — treat it as a no-op.
      }
      return false
    },
    [game, finishMove],
  )

  // Apply a move given in UCI form ("e2e4", "e7e8q") — used for engine moves.
  const playUci = useCallback(
    (uci) => {
      if (!uci || uci.length < 4) return false
      const from = uci.slice(0, 2)
      const to = uci.slice(2, 4)
      const promotion = uci.length > 4 ? uci[4] : undefined
      return applyMove(from, to, promotion)
    },
    [applyMove],
  )

  // Click-to-move selection logic.
  const selectSquare = useCallback(
    (square) => {
      if (pendingPromotion || result) return
      const piece = game.get(square)

      if (selected) {
        const matching = game
          .moves({ square: selected, verbose: true })
          .filter((m) => m.to === square)

        if (matching.length) {
          if (matching.some((m) => m.flags.includes('p'))) {
            // Pawn reaching the back rank — ask the player which piece.
            setPendingPromotion({ from: selected, to: square })
            return
          }
          applyMove(selected, square)
          return
        }
        // Clicked a different friendly piece -> change selection.
        if (piece && piece.color === turn) {
          setSelected(square)
          return
        }
        // Clicked an empty / illegal square -> clear selection.
        setSelected(null)
        return
      }

      // Nothing selected yet -> only allow selecting the side to move.
      if (piece && piece.color === turn) setSelected(square)
    },
    [game, selected, turn, pendingPromotion, result, applyMove],
  )

  const choosePromotion = useCallback(
    (pieceType) => {
      if (!pendingPromotion) return
      applyMove(pendingPromotion.from, pendingPromotion.to, pieceType)
    },
    [pendingPromotion, applyMove],
  )

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null)
    setSelected(null)
  }, [])

  const undo = useCallback(
    (count = 1) => {
      for (let i = 0; i < count; i += 1) {
        if (game.history().length > 0) game.undo()
      }
      setSelected(null)
      setResult(null)
      const history = game.history({ verbose: true })
      const last = history[history.length - 1]
      setLastMove(last ? { from: last.from, to: last.to } : null)
      bump()
    },
    [game, bump],
  )

  const reset = useCallback(() => {
    gameRef.current = new Chess()
    setSelected(null)
    setLastMove(null)
    setPendingPromotion(null)
    setResult(null)
    bump()
  }, [bump])

  // End the game immediately with the given side marked as having resigned.
  const resign = useCallback((color) => {
    setResult({ type: 'resign', winner: color === 'w' ? 'b' : 'w' })
  }, [])

  // A random legal move for the side to move, in UCI form — used by the easy
  // computer levels so the opponent plays like a beginner.
  const getRandomMoveUci = useCallback(() => {
    const moves = game.moves({ verbose: true })
    if (!moves.length) return null
    const m = moves[Math.floor(Math.random() * moves.length)]
    return m.from + m.to + (m.promotion || '')
  }, [game])

  return {
    fen: game.fen(),
    board,
    turn,
    inCheck,
    checkSquare,
    selected,
    legalTargets,
    lastMove,
    pendingPromotion,
    result,
    historyLength: game.history().length,
    selectSquare,
    choosePromotion,
    cancelPromotion,
    playUci,
    undo,
    reset,
    resign,
    getRandomMoveUci,
  }
}
