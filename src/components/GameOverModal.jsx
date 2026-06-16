import { formatTime } from '../utils/timeHelpers'

// Headline + subtitle for each kind of ending.
function describe(result) {
  if (!result) return { title: '', subtitle: '' }
  switch (result.type) {
    case 'checkmate':
      return {
        title: 'Checkmate!',
        subtitle: result.winner === 'w' ? 'white wins' : 'black wins',
      }
    case 'resign':
      return {
        title: 'Resigned',
        subtitle: result.winner === 'w' ? 'white wins' : 'black wins',
      }
    case 'stalemate':
      return { title: 'Stalemate!', subtitle: 'draw' }
    case 'draw':
      return { title: 'Draw!', subtitle: result.reason || 'draw' }
    default:
      return { title: 'Game over', subtitle: '' }
  }
}

export default function GameOverModal({ result, times, onRestart, onHome, onReview }) {
  const { title, subtitle } = describe(result)

  return (
    <div className="modal-overlay">
      <div className="wood-panel gameover-panel">
        <h2 className="heading gameover-title">{title}</h2>
        <p className="gameover-subtitle">({subtitle})</p>

        <div className="gameover-times">
          <div className="gameover-time">
            <span className="piece white">♚</span>
            <span>{formatTime(times.w)}</span>
          </div>
          <div className="gameover-time">
            <span className="piece black">♚</span>
            <span>{formatTime(times.b)}</span>
          </div>
        </div>

        <div className="gameover-buttons">
          <button type="button" className="icon-btn big" title="Restart" onClick={onRestart}>
            ↺
          </button>
          <button type="button" className="icon-btn big" title="Home" onClick={onHome}>
            ⌂
          </button>
          <button type="button" className="icon-btn big" title="Review board" onClick={onReview}>
            👁
          </button>
        </div>
      </div>
    </div>
  )
}
