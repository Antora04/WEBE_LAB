/* ── Sliding Puzzle ── */
window.SlidingPuzzle = {
  id: 'sliding',
  init(container, onScore) {
    const SIZE = 4;
    let tiles, moves, startTime, gameActive;

    function isSolvable(arr) {
      let inv = 0;
      const flat = arr.filter(x => x !== 0);
      for (let i = 0; i < flat.length; i++)
        for (let j = i+1; j < flat.length; j++)
          if (flat[i] > flat[j]) inv++;
      const emptyRow = Math.floor(arr.indexOf(0) / SIZE);
      if (SIZE % 2 === 0) return (inv + emptyRow) % 2 === 1;
      return inv % 2 === 0;
    }

    function shuffle() {
      let arr;
      do {
        arr = Array.from({length: SIZE*SIZE}, (_,i) => i);
        for (let i = arr.length-1; i > 0; i--) {
          const j = Math.random()*(i+1)|0;
          [arr[i],arr[j]] = [arr[j],arr[i]];
        }
      } while (!isSolvable(arr) || isGoal(arr));
      return arr;
    }

    function isGoal(arr) { return arr.every((v,i) => v === (i === arr.length-1 ? 0 : i+1)); }

    function start() {
      tiles = shuffle();
      moves = 0; gameActive = true; startTime = Date.now();
      render();
    }

    function render() {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%">
          <div style="font-size:0.9rem">Moves: <strong id="sp-moves" style="color:var(--cyan)">0</strong></div>
          <div class="sliding-grid" id="sp-grid" style="grid-template-columns:repeat(${SIZE},1fr);max-width:320px;"></div>
          <p style="font-size:0.78rem;color:#64748b">Click a tile adjacent to the blank to slide it</p>
        </div>`;
      renderGrid();
    }

    function renderGrid() {
      const grid = container.querySelector('#sp-grid');
      grid.innerHTML = '';
      tiles.forEach((val, i) => {
        const tile = document.createElement('div');
        tile.className = 'slide-tile' + (val === 0 ? ' empty' : '');
        tile.textContent = val || '';
        if (val !== 0) tile.addEventListener('click', () => tryMove(i));
        grid.appendChild(tile);
      });
    }

    function tryMove(i) {
      if (!gameActive) return;
      const empty = tiles.indexOf(0);
      const row = Math.floor(i / SIZE), col = i % SIZE;
      const eRow = Math.floor(empty / SIZE), eCol = empty % SIZE;
      if ((Math.abs(row-eRow) + Math.abs(col-eCol)) !== 1) return;
      [tiles[i], tiles[empty]] = [tiles[empty], tiles[i]];
      moves++;
      container.querySelector('#sp-moves').textContent = moves;
      renderGrid();
      if (isGoal(tiles)) {
        gameActive = false;
        const time = Math.round((Date.now()-startTime)/1000);
        const score = Math.max(50, 1000 - moves * 5 - time);
        onScore(score);
      }
    }

    start();
    return { restart: start };
  }
};
