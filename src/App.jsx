import { useCallback, useEffect, useRef, useState } from 'react'
import StartScreen from './components/StartScreen'
import ChessBoard from './components/ChessBoard'
import GameControls from './components/GameControls'
import PromotionModal from './components/PromotionModal'
import GameOverModal from './components/GameOverModal'
import PauseMenu from './components/PauseMenu'
import ConfirmDialog from './components/ConfirmDialog'
import { useChessGame } from './hooks/useChessGame'
import { useStockfish } from './hooks/useStockfish'
import { formatTime } from './utils/timeHelpers'

// Small status strip showing a side's clock and whether it is their turn.
function PlayerBar({ color, label, time, active, thinking }) {
  return (
    <div className={`player-bar${active ? ' active' : ''}`}>
      <span className={`piece ${color === 'w' ? 'white' : 'black'}`}>♚</span>
      <span className="player-name">{label}</span>
      <span className="player-clock">{formatTime(time)}</span>
      {thinking && <span className="thinking-tag">Computer thinking…</span>}
    </div>
  )
}

export default function App() {
  const chess = useChessGame()
  const { error: engineError, getBestMove } = useStockfish()

  const [screen, setScreen] = useState('start') // 'start' | 'game'
  const [mode, setMode] = useState('pvp') // 'pvp' | 'pvc'
  const [difficulty, setDifficulty] = useState(2)
  const [playerColor, setPlayerColor] = useState('w') // human color in pvc

  const [paused, setPaused] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [confirm, setConfirm] = useState(null) // { message, confirmLabel, onConfirm }

  const [times, setTimes] = useState({ w: 0, b: 0 })

  // Generation counter: bumped on reset/home so any in-flight engine reply that
  // resolves late is ignored instead of being played onto a fresh board.
  const genRef = useRef(0)

  // ---------- Clocks ----------
  // A single 1s interval that adds to whichever side is to move while running.
  const runningRef = useRef(false)
  const turnRef = useRef('w')
  runningRef.current = screen === 'game' && !paused && !chess.result && !reviewMode
  turnRef.current = chess.turn

  useEffect(() => {
    const id = setInterval(() => {
      if (!runningRef.current) return
      setTimes((t) => ({ ...t, [turnRef.current]: t[turnRef.current] + 1 }))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // ---------- Game lifecycle ----------
  const startGame = useCallback(
    (opts) => {
      genRef.current += 1
      setMode(opts.mode)
      if (opts.difficulty) setDifficulty(opts.difficulty)
      if (opts.playerColor) setPlayerColor(opts.playerColor)
      chess.reset()
      setTimes({ w: 0, b: 0 })
      setPaused(false)
      setReviewMode(false)
      setAiThinking(false)
      setConfirm(null)
      setScreen('game')
    },
    [chess],
  )

  const restartGame = useCallback(() => {
    genRef.current += 1
    chess.reset()
    setTimes({ w: 0, b: 0 })
    setPaused(false)
    setReviewMode(false)
    setAiThinking(false)
    setConfirm(null)
  }, [chess])

  const goHome = useCallback(() => {
    genRef.current += 1
    chess.reset()
    setTimes({ w: 0, b: 0 })
    setPaused(false)
    setReviewMode(false)
    setAiThinking(false)
    setConfirm(null)
    setScreen('start')
  }, [chess])

  // ---------- Computer opponent ----------
  useEffect(() => {
    if (screen !== 'game' || mode !== 'pvc') return
    if (chess.result || reviewMode) return
    if (engineError) return
    if (chess.turn === playerColor) return // human's move
    if (aiThinking) return

    const myGen = genRef.current
    setAiThinking(true)
    getBestMove(chess.fen, difficulty)
      .then((uci) => {
        if (genRef.current !== myGen) return // game was reset meanwhile
        if (uci) chess.playUci(uci)
      })
      .catch(() => {
        /* surfaced via engineError */
      })
      .finally(() => {
        if (genRef.current === myGen) setAiThinking(false)
      })
    // We intentionally key this on the position (fen/turn) rather than the
    // changing `chess` object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, mode, chess.fen, chess.turn, chess.result, reviewMode, playerColor, difficulty])

  // ---------- Interaction ----------
  const humanTurn = mode === 'pvp' || chess.turn === playerColor
  const inputLocked =
    paused || !!chess.result || reviewMode || aiThinking || !humanTurn

  const handleSquareClick = useCallback(
    (square) => {
      if (inputLocked) return
      chess.selectSquare(square)
    },
    [inputLocked, chess],
  )

  // ---------- Controls ----------
  const canUndo = !chess.result && !aiThinking && chess.historyLength > 0

  const handleUndo = useCallback(() => {
    if (!canUndo) return
    // In vs-Computer, undo the engine reply *and* the player move together.
    const count = mode === 'pvc' ? Math.min(2, chess.historyLength) : 1
    chess.undo(count)
  }, [canUndo, mode, chess])

  const handleResign = useCallback(() => {
    setConfirm({
      message: 'Resign this game?',
      confirmLabel: 'Resign',
      onConfirm: () => {
        const resignColor = mode === 'pvc' ? playerColor : chess.turn
        chess.resign(resignColor)
        setPaused(false)
        setConfirm(null)
      },
    })
  }, [mode, playerColor, chess])

  const handleRestart = useCallback(() => {
    setConfirm({
      message: 'Start a new game?',
      confirmLabel: 'New game',
      onConfirm: restartGame,
    })
  }, [restartGame])

  const handleHome = useCallback(() => {
    const inProgress = chess.historyLength > 0 && !chess.result
    if (!inProgress) {
      goHome()
      return
    }
    setConfirm({
      message: 'Leave this game and return to the menu?',
      confirmLabel: 'Go home',
      onConfirm: goHome,
    })
  }, [chess.historyLength, chess.result, goHome])

  // ---------- Render ----------
  if (screen === 'start') {
    return (
      <div className="app">
        <StartScreen onStart={startGame} engineError={engineError} />
      </div>
    )
  }

  const whiteActive = chess.turn === 'w' && !chess.result
  const blackActive = chess.turn === 'b' && !chess.result
  const computerColor = mode === 'pvc' ? (playerColor === 'w' ? 'b' : 'w') : null

  const blackLabel =
    mode === 'pvc' ? (computerColor === 'b' ? 'Computer' : 'You') : 'Black'
  const whiteLabel =
    mode === 'pvc' ? (computerColor === 'w' ? 'Computer' : 'You') : 'White'

  return (
    <div className="app game-screen">
      <PlayerBar
        color="b"
        label={blackLabel}
        time={times.b}
        active={blackActive}
        thinking={aiThinking && computerColor === 'b'}
      />

      <ChessBoard
        board={chess.board}
        selected={chess.selected}
        legalTargets={chess.legalTargets}
        lastMove={chess.lastMove}
        checkSquare={chess.checkSquare}
        onSquareClick={handleSquareClick}
        disabled={inputLocked}
      />

      <PlayerBar
        color="w"
        label={whiteLabel}
        time={times.w}
        active={whiteActive}
        thinking={aiThinking && computerColor === 'w'}
      />

      {engineError && mode === 'pvc' && (
        <p className="engine-warning">Chess engine unavailable — moves are manual.</p>
      )}

      <GameControls
        onUndo={handleUndo}
        onPause={() => setPaused(true)}
        onResign={handleResign}
        onRestart={handleRestart}
        onHome={handleHome}
        canUndo={canUndo}
      />

      {/* Review mode: board is visible, moves disabled, with a way back. */}
      {reviewMode && (
        <div className="review-bar">
          <button type="button" className="wood-btn" onClick={() => setReviewMode(false)}>
            Back to result
          </button>
          <button type="button" className="wood-btn ghost" onClick={goHome}>
            Home
          </button>
        </div>
      )}

      {chess.pendingPromotion && (
        <PromotionModal color={chess.turn} onSelect={chess.choosePromotion} />
      )}

      {paused && !chess.result && (
        <PauseMenu
          onResume={() => setPaused(false)}
          onRestart={handleRestart}
          onResign={handleResign}
          onHome={handleHome}
        />
      )}

      {chess.result && !reviewMode && (
        <GameOverModal
          result={chess.result}
          times={times}
          onRestart={handleRestart}
          onHome={handleHome}
          onReview={() => setReviewMode(true)}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
