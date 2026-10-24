/* ── Word Guess (Wordle-like) ── */
window.WordGuess = {
  id: 'wordguess',
  init(container, onScore) {
    const WORDS = [
      'FLAME','BRAVE','CHESS','CLOUD','DRIFT','FLASH','GLIDE','GRACE',
      'HANDY','HASTE','KNEEL','LUCKY','MAGIC','NIGHT','ORBIT','PIXEL',
      'QUEST','RAPID','SHARP','SLEEK','SMART','SPARK','SPEED','SPORT',
      'STUMP','SWIFT','TRICK','TWIST','ULTRA','VALID','VIVID','VOCAL',
      'WATCH','WITCH','WORLD','WORTH','YIELD','ZEBRA','AMONG','BLAST'
    ];
    const WORD_LEN = 5, MAX_GUESSES = 6;
    let secret, guesses, currentGuess, gameActive, keyStates;

    function start() {
      secret = WORDS[Math.random() * WORDS.length | 0];
      guesses = []; currentGuess = ''; gameActive = true;
      keyStates = {};
      render();
    }

    function render() {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%">
          <div class="wg-board" id="wg-board"></div>
          <div id="wg-msg" style="font-size:1rem;font-weight:700;min-height:24px;color:var(--cyan)"></div>
          <div class="wg-keyboard" id="wg-keyboard"></div>
        </div>`;
      renderBoard();
      renderKeyboard();
    }

    function renderBoard() {
      const board = container.querySelector('#wg-board');
      board.innerHTML = '';
      for (let g = 0; g < MAX_GUESSES; g++) {
        const row = document.createElement('div');
        row.className = 'wg-row';
        for (let c = 0; c < WORD_LEN; c++) {
          const cell = document.createElement('div');
          cell.className = 'wg-cell';
          if (g < guesses.length) {
            const { word, result } = guesses[g];
            cell.textContent = word[c];
            cell.classList.add(result[c]);
          } else if (g === guesses.length) {
            cell.textContent = currentGuess[c] || '';
            if (c === currentGuess.length) cell.classList.add('active');
          }
          row.appendChild(cell);
        }
        board.appendChild(row);
      }
    }

    function renderKeyboard() {
      const rows = [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['ENTER','Z','X','C','V','B','N','M','⌫']];
      const kb = container.querySelector('#wg-keyboard');
      kb.innerHTML = '';
      rows.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'wg-kb-row';
        row.forEach(key => {
          const btn = document.createElement('button');
          btn.className = 'wg-key' + (key.length > 1 ? ' wide' : '');
          btn.textContent = key;
          btn.dataset.key = key;
          if (keyStates[key]) btn.classList.add(keyStates[key]);
          btn.addEventListener('click', () => handleKey(key));
          rowEl.appendChild(btn);
        });
        kb.appendChild(rowEl);
      });
    }

    function handleKey(key) {
      if (!gameActive) return;
      if (key === '⌫' || key === 'BACKSPACE') {
        currentGuess = currentGuess.slice(0, -1);
      } else if (key === 'ENTER') {
        submitGuess();
        return;
      } else if (currentGuess.length < WORD_LEN && /^[A-Z]$/.test(key)) {
        currentGuess += key;
      }
      renderBoard();
    }

    function submitGuess() {
      if (currentGuess.length !== WORD_LEN) {
        const msg = container.querySelector('#wg-msg');
        msg.textContent = 'Word must be 5 letters!';
        setTimeout(() => { msg.textContent = ''; }, 1500);
        return;
      }
      const result = evaluateGuess(currentGuess, secret);
      // Update key states
      currentGuess.split('').forEach((ch, i) => {
        const cur = keyStates[ch];
        const r = result[i];
        if (cur !== 'correct') {
          if (r === 'correct') keyStates[ch] = 'correct';
          else if (r === 'present' && cur !== 'correct') keyStates[ch] = 'present';
          else if (!cur) keyStates[ch] = 'absent';
        }
      });
      guesses.push({ word: currentGuess, result });
      const won = result.every(r => r === 'correct');
      currentGuess = '';
      renderBoard();
      renderKeyboard();
      const msg = container.querySelector('#wg-msg');
      if (won) {
        msg.textContent = '🎉 Brilliant! You got it!';
        onScore(Math.max(50, (MAX_GUESSES - guesses.length + 1) * 100));
        gameActive = false;
      } else if (guesses.length >= MAX_GUESSES) {
        msg.textContent = `Game over! The word was ${secret}`;
        gameActive = false;
      }
    }

    function evaluateGuess(guess, secret) {
      const result = Array(WORD_LEN).fill('absent');
      const secArr = secret.split('');
      const guessArr = guess.split('');
      // First pass: correct
      guessArr.forEach((ch, i) => { if (ch === secArr[i]) { result[i] = 'correct'; secArr[i] = null; guessArr[i] = null; } });
      // Second pass: present
      guessArr.forEach((ch, i) => {
        if (!ch) return;
        const j = secArr.indexOf(ch);
        if (j !== -1) { result[i] = 'present'; secArr[j] = null; }
      });
      return result;
    }

    // Physical keyboard support
    const keyHandler = e => {
      if (!gameActive) return;
      const k = e.key.toUpperCase();
      if (k === 'BACKSPACE') handleKey('⌫');
      else if (k === 'ENTER') handleKey('ENTER');
      else if (/^[A-Z]$/.test(k)) handleKey(k);
    };
    document.addEventListener('keydown', keyHandler);

    start();
    return {
      restart: start,
      destroy() { document.removeEventListener('keydown', keyHandler); }
    };
  }
};
