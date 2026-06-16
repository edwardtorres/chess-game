import { PIECE_GLYPHS } from '../utils/chessHelpers'

// A single board square: paints its background, any highlight overlays, the
// move/capture markers, and the piece glyph.
export default function Square({
  square,
  piece,
  isLight,
  isSelected,
  isLegal,
  isCapture,
  isLastMove,
  isCheck,
  onClick,
}) {
  const classes = ['square', isLight ? 'light' : 'dark']
  if (isSelected) classes.push('selected')
  if (isLastMove) classes.push('last-move')
  if (isCheck) classes.push('in-check')

  return (
    <div className={classes.join(' ')} data-square={square} onClick={() => onClick(square)}>
      {/* Capture targets get a ring around the square; quiet moves get a dot. */}
      {isLegal && isCapture && <span className="capture-ring" />}
      {isLegal && !isCapture && <span className="move-dot" />}

      {piece && (
        <span className={`piece ${piece.color === 'w' ? 'white' : 'black'}`}>
          {PIECE_GLYPHS[piece.type]}
        </span>
      )}
    </div>
  )
}
