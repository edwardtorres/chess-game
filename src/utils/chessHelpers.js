// Helpers shared across the board UI. Keeping these pure and tiny makes the
// components easy to read.

// Unicode glyphs for chess pieces. We use the "filled" set for BOTH colors and
// let CSS paint them (cream vs. dark brown), which gives clean, solid
// silhouettes instead of thin outlined white glyphs.
export const PIECE_GLYPHS = {
  k: '♚', // ♚
  q: '♛', // ♛
  r: '♜', // ♜
  b: '♝', // ♝
  n: '♞', // ♞
  p: '♟', // ♟
}

export const PIECE_NAMES = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
  p: 'Pawn',
  k: 'King',
}

// File letters left-to-right, rank numbers top-to-bottom (white's view).
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

// Build a square name like "e4" from grid indices, where rankIdx 0 is rank 8
// (top of the board) to match the array returned by chess.js `board()`.
export function squareName(fileIdx, rankIdx) {
  return FILES[fileIdx] + RANKS[rankIdx]
}

// a8 (top-left corner) is a light square. Squares alternate from there.
export function isLightSquare(fileIdx, rankIdx) {
  return (fileIdx + rankIdx) % 2 === 0
}
