/* ── Tic-Tac-Toe ── */
window.TicTacToe = {
  id: 'tictactoe',
  init(container, onScore) {
    let board = Array(9).fill('');
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = { X: 0, O: 0 };

    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%">
        <div class="ttt-turn-indicator">
          <div class="turn-player active-x" id="ttt-px">Player X</div>
          <div class="turn-player" id="ttt-po">Player O</div>
        </div>
        <div class="ttt-board" id="ttt-board"></div>
        <div class="ttt-status" id="ttt-status">Player X's turn</div>
        <div style="display:flex;gap:24px;font-size:0.9rem;margin-top:8px">
          <span>X: <strong id="ttt-sx" style="color:var(--cyan)">0</strong></span>
          <span>O: <strong id="ttt-so" style="color:var(--pink)">0</strong></span>
        </div>
      </div>`;

    const boardEl = container.querySelector('#ttt-board');
    const status = container.querySelector('#ttt-status');
    const px = container.querySelector('#ttt-px');
    const po = container.querySelector('#ttt-po');
    const sx = container.querySelector('#ttt-sx');
    const so = container.querySelector('#ttt-so');

    function renderBoard() {
      boardEl.innerHTML = '';
      board.forEach((cell, i) => {
        const el = document.createElement('button');
        el.className = 'ttt-cell' + (cell ? ' ' + cell.toLowerCase() : '');
        el.textContent = cell;
        el.setAttribute('aria-label', `Cell ${i+1}: ${cell || 'empty'}`);
        el.addEventListener('click', () => handleClick(i));
        boardEl.appendChild(el);
      });
    }

    function handleClick(i) {
      if (!gameActive || board[i]) return;
      board[i] = currentPlayer;
      renderBoard();
      const win = checkWin();
      if (win) {
        win.forEach(idx => boardEl.children[idx].classList.add('win'));
        scores[currentPlayer]++;
        sx.textContent = scores.X;
        so.textContent = scores.O;
        status.textContent = `🎉 Player ${currentPlayer} wins!`;
        onScore(scores.X + scores.O * 10);
        gameActive = false;
      } else if (board.every(c => c)) {
        status.textContent = "🤝 It's a draw!";
        gameActive = false;
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        status.textContent = `Player ${currentPlayer}'s turn`;
        px.className = 'turn-player' + (currentPlayer === 'X' ? ' active-x' : '');
        po.className = 'turn-player' + (currentPlayer === 'O' ? ' active-o' : '');
      }
    }

    function checkWin() {
      return wins.find(combo => combo.every(i => board[i] === currentPlayer)) || null;
    }

    function restart() {
      board = Array(9).fill('');
      currentPlayer = 'X';
      gameActive = true;
      px.className = 'turn-player active-x';
      po.className = 'turn-player';
      status.textContent = "Player X's turn";
      renderBoard();
    }

    renderBoard();
    return { restart };
  }
};
