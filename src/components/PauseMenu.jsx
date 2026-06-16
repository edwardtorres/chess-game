// The pause / in-game menu overlay.
export default function PauseMenu({ onResume, onRestart, onHome, onResign }) {
  return (
    <div className="modal-overlay">
      <div className="wood-panel pause-panel">
        <h2 className="heading panel-title">Paused</h2>
        <div className="pause-buttons">
          <button type="button" className="wood-btn" onClick={onResume}>
            Resume
          </button>
          <button type="button" className="wood-btn" onClick={onRestart}>
            Restart
          </button>
          <button type="button" className="wood-btn" onClick={onResign}>
            Resign
          </button>
          <button type="button" className="wood-btn" onClick={onHome}>
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
