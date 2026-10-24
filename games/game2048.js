/* ── 2048 ── */
window.Game2048 = {
  id: 'game2048',
  init(container, onScore) {
    let board, score, best = 0, gameOver = false;
    let touchStartX, touchStartY;

    const colors = {
      0:'#0a0e2e', 2:'#1e3a5f', 4:'#1e4d8c', 8:'#1565c0', 16:'#1976d2',
      32:'#7b1fa2', 64:'#8e24aa', 128:'#ab47bc', 256:'#ce93d8',
      512:'#ff6f00', 1024:'#ffa000', 2048:'#ffd54f'
    };
    const textColors = { 0:'transparent', 2:'#93c5fd', 4:'#93c5fd', 8:'#fff', 16:'#fff', 32:'#fff', 64:'#fff', 128:'#fff', 256:'#fff', 512:'#fff', 1024:'#fff', 2048:'#05071a' };

    function newBoard() { return Array(4).fill(null).map(() => Array(4).fill(0)); }
    function addRandom(b) {
      const empty = [];
      b.forEach((row,r) => row.forEach((v,c) => { if (!v) empty.push([r,c]); }));
      if (!empty.length) return;
      const [r,c] = empty[Math.random()*empty.length|0];
      b[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
    function slide(row) {
      let arr = row.filter(v => v), gained = 0;
      for (let i = 0; i < arr.length-1; i++) {
        if (arr[i] === arr[i+1]) { arr[i] *= 2; gained += arr[i]; arr.splice(i+1,1); }
      }
      while (arr.length < 4) arr.push(0);
      return { arr, gained };
    }
    function move(dir) {
      if (gameOver) return;
      let moved = false, gained = 0;
      const nb = newBoard();
      if (dir === 'left' || dir === 'right') {
        board.forEach((row, r) => {
          const rev = dir === 'right' ? [...row].reverse() : [...row];
          const { arr, gained: g } = slide(rev);
          gained += g;
          const final = dir === 'right' ? arr.reverse() : arr;
          final.forEach((v,c) => { nb[r][c] = v; if (board[r][c]!==v) moved=true; });
        });
      } else {
        for (let c = 0; c < 4; c++) {
          const col = board.map(r => r[c]);
          const rev = dir === 'down' ? [...col].reverse() : [...col];
          const { arr, gained: g } = slide(rev);
          gained += g;
          const final = dir === 'down' ? arr.reverse() : arr;
          final.forEach((v,r) => { nb[r][c] = v; if (board[r][c]!==v) moved=true; });
        }
      }
      if (!moved) return;
      board = nb; score += gained;
      if (score > best) best = score;
      onScore(score);
      addRandom(board);
      checkGameOver();
      render();
    }

    function checkGameOver() {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (!board[r][c]) return;
        if (c<3 && board[r][c]===board[r][c+1]) return;
        if (r<3 && board[r][c]===board[r+1][c]) return;
      }
      gameOver = true;
    }

    function render() {
      const gridEl = container.querySelector('#board-2048');
      if (!gridEl) return;
      gridEl.innerHTML = '';
      board.forEach(row => row.forEach(v => {
        const tile = document.createElement('div');
        tile.className = 'tile-2048';
        tile.textContent = v || '';
        tile.style.background = colors[Math.min(v,2048)] || '#ffd54f';
        tile.style.color = textColors[Math.min(v,2048)] || '#05071a';
        if (v >= 128) tile.style.fontSize = '1rem';
        if (v >= 512) tile.style.fontSize = '0.85rem';
        gridEl.appendChild(tile);
      }));
      const sc = container.querySelector('#score-2048');
      const bs = container.querySelector('#best-2048');
      if (sc) sc.textContent = score;
      if (bs) bs.textContent = best;
    }

    function start() {
      board = newBoard(); score = 0; gameOver = false;
      addRandom(board); addRandom(board);
      render();
    }

    container.innerHTML = `
      <div class="game-2048-wrap" id="g2048" style="width:100%">
        <div style="display:flex;gap:24px;font-size:0.9rem;margin-bottom:8px">
          <span>Score: <strong id="score-2048" style="color:var(--cyan)">0</strong></span>
          <span>Best: <strong id="best-2048" style="color:var(--orange)">0</strong></span>
        </div>
        <div class="board-2048" id="board-2048"></div>
        <p style="font-size:0.78rem;color:#64748b;margin-top:8px">Arrow keys or WASD to move tiles · Swipe on mobile</p>
      </div>`;

    const handleKey = e => {
      const map = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down', a:'left', d:'right', w:'up', s:'down' };
      if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
    };
    document.addEventListener('keydown', handleKey);

    const wrap = container.querySelector('#g2048');
    wrap.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
      else move(dy > 0 ? 'down' : 'up');
    }, { passive: true });

    start();

    return {
      restart: start,
      destroy() { document.removeEventListener('keydown', handleKey); }
    };
  }
};
