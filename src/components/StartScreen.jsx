import { useState } from 'react'

// Toggle the whole document in/out of fullscreen. Visual nicety only.
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

const STARS = [1, 2, 3, 4, 5]

export default function StartScreen({ onStart, engineError }) {
  const [difficulty, setDifficulty] = useState(2)
  const [playerColor, setPlayerColor] = useState('w')

  return (
    <div className="start-screen">
      <div className="start-topbar">
        <button
          type="button"
          className="icon-btn"
          title="Toggle fullscreen"
          onClick={toggleFullscreen}
        >
          ⛶
        </button>
      </div>

      <h1 className="heading start-title">
        Choose
        <br />
        Game Mode
      </h1>

      <div className="mode-cards">
        <button
          type="button"
          className="mode-card"
          onClick={() => onStart({ mode: 'pvp' })}
        >
          <span className="mode-card-icon">🧑‍🤝‍🧑</span>
          <span className="mode-card-label">Player vs Player</span>
        </button>

        <button
          type="button"
          className="mode-card"
          onClick={() => onStart({ mode: 'pvc', difficulty, playerColor })}
        >
          <span className="mode-card-icon">🧑‍💻</span>
          <span className="mode-card-label">Player vs Computer</span>
        </button>
      </div>

      {/* Settings that apply when you start a Player-vs-Computer game. */}
      <div className="start-options">
        <div className="option-group">
          <span className="option-label">Play as</span>
          <div className="color-toggle">
            <button
              type="button"
              className={`color-btn${playerColor === 'w' ? ' active' : ''}`}
              onClick={() => setPlayerColor('w')}
            >
              White
            </button>
            <button
              type="button"
              className={`color-btn${playerColor === 'b' ? ' active' : ''}`}
              onClick={() => setPlayerColor('b')}
            >
              Black
            </button>
          </div>
        </div>

        <div className="option-group">
          <span className="option-label">Computer difficulty</span>
          <div className="star-select">
            {STARS.map((level) => (
              <button
                type="button"
                key={level}
                className={`star-btn${difficulty >= level ? ' on' : ''}`}
                title={`${level} star${level > 1 ? 's' : ''}`}
                onClick={() => setDifficulty(level)}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      {engineError && (
        <p className="engine-warning">
          Chess engine could not load — “Player vs Computer” may not work, but
          two-player games will run fine.
        </p>
      )}
    </div>
  )
}
