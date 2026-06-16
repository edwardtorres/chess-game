import { PIECE_GLYPHS } from '../utils/chessHelpers'

// Order matches the reference screenshot: Bishop, Rook, Knight, Queen.
const CHOICES = ['b', 'r', 'n', 'q']

// Shown when a pawn reaches the back rank. The player MUST pick a piece — there
// is no silent default.
export default function PromotionModal({ color, onSelect }) {
  return (
    <div className="modal-overlay">
      <div className="wood-panel promotion-panel">
        <h2 className="heading panel-title">
          Select the piece you want to
          <br />
          promote your pawn into
        </h2>
        <div className="promotion-choices">
          {CHOICES.map((type) => (
            <button
              type="button"
              key={type}
              className="promotion-choice"
              onClick={() => onSelect(type)}
            >
              <span className={`piece ${color === 'w' ? 'white' : 'black'}`}>
                {PIECE_GLYPHS[type]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
