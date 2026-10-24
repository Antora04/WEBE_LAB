/* ── Sudoku ── */
window.SudokuGame = {
  id: 'sudoku',
  init(container, onScore) {
    // Pre-built puzzle sets [puzzle, solution]
    const puzzles = [
      {
        puzzle: [
          [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
          [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
          [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]
        ],
        solution: [
          [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
          [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
          [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]
        ]
      }
    ];

    let puzzle, solution, userBoard, selectedCell = null;

    function loadPuzzle() {
      const p = puzzles[0];
      puzzle = p.puzzle.map(r => [...r]);
      solution = p.solution.map(r => [...r]);
      userBoard = puzzle.map(r => [...r]);
      selectedCell = null;
      render();
    }

    function render() {
      container.innerHTML = `
        <div class="sudoku-wrap" id="sudoku-wrap" style="width:100%">
          <div class="sudoku-grid" id="sudoku-grid"></div>
          <div class="sudoku-numpad" id="sudoku-numpad"></div>
          <p style="font-size:0.78rem;color:#64748b;margin-top:8px">Click a cell then tap a number · Cyan = given · Violet = your input</p>
        </div>`;

      const grid = container.querySelector('#sudoku-grid');
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const cell = document.createElement('div');
          cell.className = 'sudoku-cell' + (puzzle[r][c] ? ' given' : ' user');
          cell.dataset.r = r; cell.dataset.c = c;
          cell.textContent = userBoard[r][c] || '';
          if ((r+1) % 3 === 0 && r < 8) cell.style.borderBottom = '2px solid rgba(99,102,241,0.5)';
          if ((c+1) % 3 === 0 && c < 8) cell.style.borderRight = '2px solid rgba(99,102,241,0.5)';
          cell.setAttribute('tabindex', puzzle[r][c] ? '-1' : '0');
          if (!puzzle[r][c]) {
            cell.addEventListener('click', () => selectCell(r, c));
            cell.addEventListener('keydown', e => {
              if (e.key >= '1' && e.key <= '9') enterNumber(r, c, parseInt(e.key));
              else if (e.key === 'Backspace' || e.key === 'Delete') enterNumber(r, c, 0);
            });
          }
          grid.appendChild(cell);
        }
      }

      // Numpad
      const numpad = container.querySelector('#sudoku-numpad');
      for (let n = 1; n <= 9; n++) {
        const btn = document.createElement('button');
        btn.textContent = n;
        btn.addEventListener('click', () => {
          if (selectedCell) enterNumber(selectedCell.r, selectedCell.c, n);
        });
        numpad.appendChild(btn);
      }
      const clrBtn = document.createElement('button');
      clrBtn.textContent = '✕';
      clrBtn.style.gridColumn = 'span 1';
      clrBtn.addEventListener('click', () => {
        if (selectedCell) enterNumber(selectedCell.r, selectedCell.c, 0);
      });
      numpad.appendChild(clrBtn);
    }

    function selectCell(r, c) {
      if (puzzle[r][c]) return;
      selectedCell = { r, c };
      container.querySelectorAll('.sudoku-cell').forEach(el => el.classList.remove('selected'));
      const cells = container.querySelectorAll('.sudoku-cell');
      cells[r * 9 + c].classList.add('selected');
    }

    function enterNumber(r, c, n) {
      if (puzzle[r][c]) return;
      userBoard[r][c] = n;
      const cells = container.querySelectorAll('.sudoku-cell');
      const cell = cells[r * 9 + c];
      cell.textContent = n || '';
      cell.classList.remove('error');
      if (n && n !== solution[r][c]) cell.classList.add('error');
      // Check win
      if (userBoard.every((row, ri) => row.every((v, ci) => v === solution[ri][ci]))) {
        onScore(500);
      }
    }

    loadPuzzle();
    return { restart: loadPuzzle };
  }
};
