# chess-game

A polished, **wooden-themed chess game** that runs entirely in your browser. Play
a friend locally or challenge a [Stockfish](https://stockfishchess.org/)-powered
computer opponent at three difficulty levels. No backend, no accounts, no
sign-up — just open it and play.

> Built with Vite + React. Frontend-only and deployable to GitHub Pages.

## Features

- ♟️ **Player vs Player** — pass-and-play on one screen.
- 🤖 **Player vs Computer** — Stockfish runs in a Web Worker, fully client-side.
- ⭐ **3 difficulty levels** via star buttons (skill level + capped depth/time).
- ⚪⚫ **Choose your side** — play the computer as White or Black.
- ✅ **Full legal chess rules** via [chess.js](https://github.com/jhlywa/chess.js):
  castling, en passant, promotion, check, checkmate, stalemate and draws.
- 🖱️ **Click-to-move** controls with:
  - legal-move dots and capture rings,
  - selected-piece glow,
  - last-move highlight,
  - king-in-check highlight.
- 👑 **Pawn promotion modal** — you choose the piece (no silent auto-queen).
- ⏱️ **Per-side elapsed clocks** (count-up only — no time pressure, no flagging).
- ⏸️ **Pause menu**, **undo**, **resign**, **new game** and **home**, each with a
  confirmation where it matters.
- 🏁 **Checkmate / stalemate / draw** result screens with a **review-board** mode.
- 📱 Responsive — scales down to smaller screens, desktop-first.

## Tech stack

| Purpose            | Choice                                   |
| ------------------ | ---------------------------------------- |
| Build tool         | [Vite](https://vite.dev/)                |
| UI                 | [React](https://react.dev/) (JavaScript) |
| Chess rules        | [chess.js](https://github.com/jhlywa/chess.js) |
| Computer opponent  | [Stockfish.js](https://github.com/nmrugg/stockfish.js) (asm.js, Web Worker) |
| Styling            | Hand-written CSS (no UI framework)       |
| Deployment         | [gh-pages](https://github.com/tschaub/gh-pages) → GitHub Pages |

## Screenshots

> _Add screenshots here once deployed._

| Choose game mode | In game | Game over |
| ---------------- | ------- | --------- |
| _(placeholder)_  | _(placeholder)_ | _(placeholder)_ |

## Run locally

```bash
npm install
npm run dev
```

Vite prints a local URL (it includes the `/chess-game/` base path — open the URL
Vite shows you).

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## Deploy to GitHub Pages

This project uses the **gh-pages** package (the simplest reliable option).

1. Create a GitHub repository named **`chess-game`** and push this code to it.
2. Confirm the base path in [`vite.config.js`](vite.config.js) matches the repo
   name. It is preconfigured as:

   ```js
   base: '/chess-game/'
   ```

   If you name the repo something else, update this value to `/<repo-name>/`.
3. Deploy:

   ```bash
   npm run deploy
   ```

   This runs `npm run build` (via `predeploy`) and publishes `dist/` to a
   `gh-pages` branch.
4. In your repo on GitHub: **Settings → Pages → Build and deployment → Source:
   "Deploy from a branch" → Branch: `gh-pages` / root.**
5. Your game will be live at
   `https://<your-username>.github.io/chess-game/`.

## Notes about Stockfish

- The engine is the **single-file asm.js build** of Stockfish.js, served from
  [`public/stockfish/stockfish.js`](public/stockfish/stockfish.js) and loaded as
  a **classic Web Worker**.
- This build was chosen on purpose: the multi-threaded WASM builds need
  `SharedArrayBuffer`, which requires cross-origin isolation (`COOP`/`COEP`)
  HTTP headers. **GitHub Pages cannot set those headers**, so the header-free
  asm.js build is the reliable choice for static hosting.
- The worker is loaded from `import.meta.env.BASE_URL + 'stockfish/stockfish.js'`
  so the path stays correct under the `/chess-game/` base.
- Difficulty maps to Stockfish's `Skill Level` plus a capped search `depth` and
  `movetime`, so the browser never freezes — see
  [`src/hooks/useStockfish.js`](src/hooks/useStockfish.js).
- If the engine fails to load, the app **does not crash**: it shows a warning and
  Player-vs-Player still works.

## Project structure

```text
src/
  main.jsx                 # entry point
  App.jsx                  # screen/state orchestration
  components/
    StartScreen.jsx        # choose game mode + difficulty + color
    ChessBoard.jsx         # board frame, labels, square grid
    Square.jsx             # one square + highlights + piece glyph
    GameControls.jsx       # undo / pause / resign / new game / home
    PromotionModal.jsx     # pick a promotion piece
    GameOverModal.jsx      # checkmate / stalemate / draw result
    PauseMenu.jsx          # pause overlay
    ConfirmDialog.jsx      # reusable yes/no confirmation
  hooks/
    useChessGame.js        # chess.js state, moves, undo, results
    useStockfish.js        # Stockfish Web Worker wrapper
  utils/
    chessHelpers.js        # piece glyphs, square helpers
    timeHelpers.js         # MM:SS formatting
  styles/
    global.css board.css screens.css buttons.css
public/
  stockfish/stockfish.js   # Stockfish engine (asm.js)
```

## Future improvements

- Drag-and-drop piece movement
- Sound effects
- Move-history / notation panel
- PGN export and import
- Online multiplayer
- Finer AI settings (Elo limiting, opening book)
- Saved games (resume in progress)

## License

Game code is yours to use freely. Note that **Stockfish is licensed under the
GPL** — see the header in `public/stockfish/stockfish.js`.
