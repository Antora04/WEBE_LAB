/* ── Minesweeper ── */
window.Minesweeper = {
  id: 'minesweeper',
  init(container, onScore) {
    const ROWS = 9, COLS = 9, MINES = 10;
    let board, revealed, flagged, gameOver, firstClick, mineCount, startTime;

    function newBoard() {
      board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
      revealed = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
      flagged = Array(ROWS).fill(null).map(() => Array(COLS).fill(false));
      gameOver = false; firstClick = true; mineCount = MINES;
    }

    function placeMines(avoidR, avoidC) {
      let placed = 0;
      while (placed < MINES) {
        const r = Math.random() * ROWS | 0;
        const c = Math.random() * COLS | 0;
        if (board[r][c] === -1 || (Math.abs(r-avoidR) <= 1 && Math.abs(c-avoidC) <= 1)) continue;
        board[r][c] = -1; placed++;
      }
      // Count neighbors
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (board[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const nr = r+dr, nc = c+dc;
          if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&board[nr][nc]===-1) count++;
        }
        board[r][c] = count;
      }
      startTime = Date.now();
    }

    function reveal(r, c) {
      if (r<0||r>=ROWS||c<0||c>=COLS||revealed[r][c]||flagged[r][c]) return;
      revealed[r][c] = true;
      if (board[r][c] === 0) {
        for (let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) reveal(r+dr,c+dc);
      }
    }

    function numColor(n) {
      return ['','#3b82f6','#10b981','#ef4444','#8b5cf6','#f59e0b','#06b6d4','#ec4899','#94a3b8'][n] || '#94a3b8';
    }

    function render() {
      const grid = container.querySelector('#ms-grid');
      if (!grid) return;
      grid.innerHTML = '';
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'ms-cell';
        cell.dataset.r = r; cell.dataset.c = c;
        if (revealed[r][c]) {
          cell.classList.add('revealed');
          if (board[r][c] === -1) { cell.textContent = '💣'; cell.classList.add('mine-hit'); }
          else if (board[r][c] > 0) { cell.textContent = board[r][c]; cell.style.color = numColor(board[r][c]); }
        } else if (flagged[r][c]) {
          cell.classList.add('flagged'); cell.textContent = '🚩';
        }
        cell.addEventListener('click', () => handleClick(r, c));
        cell.addEventListener('contextmenu', e => { e.preventDefault(); handleFlag(r, c); });
        grid.appendChild(cell);
      }
      const mc = container.querySelector('#ms-mines');
      if (mc) mc.textContent = MINES - flagged.reduce((s,row) => s + row.filter(Boolean).length, 0);
    }

    function handleClick(r, c) {
      if (gameOver || revealed[r][c] || flagged[r][c]) return;
      if (firstClick) { placeMines(r, c); firstClick = false; }
      if (board[r][c] === -1) {
        revealAllMines(); gameOver = true; render();
        return;
      }
      reveal(r, c);
      checkWin();
      render();
    }

    function handleFlag(r, c) {
      if (gameOver || revealed[r][c]) return;
      flagged[r][c] = !flagged[r][c];
      render();
    }

    function revealAllMines() {
      for (let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(board[r][c]===-1) revealed[r][c]=true;
    }

    function checkWin() {
      const unrevealed = ROWS*COLS - revealed.reduce((s,row) => s+row.filter(Boolean).length, 0);
      if (unrevealed === MINES) {
        gameOver = true;
        const time = Math.round((Date.now()-startTime)/1000);
        const score = Math.max(100, 1000 - time * 10);
        onScore(score);
      }
    }

    function start() {
      newBoard();
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">
          <div class="ms-info">
            <span>💣 <strong id="ms-mines">${MINES}</strong></span>
            <span style="font-size:0.78rem;color:#64748b">Left-click: reveal · Right-click: flag</span>
          </div>
          <div class="ms-grid" id="ms-grid" style="grid-template-columns:repeat(${COLS},1fr)"></div>
        </div>`;
      render();
    }

    start();
    return { restart: start };
  }
};
