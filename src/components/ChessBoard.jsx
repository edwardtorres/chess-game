import Square from './Square'
import { FILES, RANKS, squareName, isLightSquare } from '../utils/chessHelpers'

// The wooden board: an 8x8 grid wrapped in a frame with coordinate labels.
// The board never rotates — it is always shown from white's perspective.
export default function ChessBoard({
  board,
  selected,
  legalTargets,
  lastMove,
  checkSquare,
  onSquareClick,
  disabled,
}) {
  return (
    <div className={`board-frame${disabled ? ' disabled' : ''}`}>
      <div className="file-labels top">
        {FILES.map((f) => (
          <span key={f}>{f.toUpperCase()}</span>
        ))}
      </div>
      <div className="rank-labels left">
        {RANKS.map((r) => (
          <span key={r}>{r}</span>
        ))}
      </div>

      <div className="board">
        {RANKS.map((_, rankIdx) =>
          FILES.map((__, fileIdx) => {
            const square = squareName(fileIdx, rankIdx)
            const piece = board[rankIdx][fileIdx]
            const target = legalTargets[square]
            return (
              <Square
                key={square}
                square={square}
                piece={piece}
                isLight={isLightSquare(fileIdx, rankIdx)}
                isSelected={selected === square}
                isLegal={!!target}
                isCapture={target ? target.capture : false}
                isLastMove={!!lastMove && (lastMove.from === square || lastMove.to === square)}
                isCheck={checkSquare === square}
                onClick={onSquareClick}
              />
            )
          }),
        )}
      </div>

      <div className="rank-labels right">
        {RANKS.map((r) => (
          <span key={r}>{r}</span>
        ))}
      </div>
      <div className="file-labels bottom">
        {FILES.map((f) => (
          <span key={f}>{f.toUpperCase()}</span>
        ))}
      </div>
    </div>
  )
}
