// Row of in-game action buttons under the board.
export default function GameControls({
  onUndo,
  onPause,
  onResign,
  onRestart,
  onHome,
  canUndo,
}) {
  return (
    <div className="game-controls">
      <button
        type="button"
        className="icon-btn"
        title="Undo"
        onClick={onUndo}
        disabled={!canUndo}
      >
        ↶
      </button>
      <button type="button" className="icon-btn" title="Pause / Menu" onClick={onPause}>
        ❚❚
      </button>
      <button type="button" className="icon-btn" title="Resign" onClick={onResign}>
        🏳
      </button>
      <button type="button" className="icon-btn" title="New game" onClick={onRestart}>
        ↺
      </button>
      <button type="button" className="icon-btn" title="Home" onClick={onHome}>
        ⌂
      </button>
    </div>
  )
}
