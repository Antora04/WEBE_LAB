/* ── Number Memory ── */
window.NumberMemory = {
  id: 'numbermemory',
  init(container, onScore) {
    let level, currentNumber, phase, lives;

    function start() {
      level = 1; lives = 3;
      nextRound();
    }

    function nextRound() {
      // Generate a number with `level` digits
      const digits = level;
      const min = Math.pow(10, digits-1);
      const max = Math.pow(10, digits) - 1;
      currentNumber = String(Math.floor(min + Math.random() * (max - min + 1)));
      phase = 'show';
      showPhase();
    }

    function showPhase() {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;max-width:500px;margin:auto">
          <div style="display:flex;gap:32px;font-size:0.9rem">
            <span>Level: <strong style="color:var(--cyan)">${level}</strong></span>
            <span>Digits: <strong style="color:var(--violet)">${level}</strong></span>
            <span>Lives: <strong style="color:var(--pink)">${'❤️'.repeat(lives)}</strong></span>
          </div>
          <p style="color:#94a3b8;font-size:0.9rem">Memorize this number:</p>
          <div class="nm-display" id="nm-display">${currentNumber}</div>
          <div id="nm-countdown" style="font-size:0.9rem;color:#64748b">Hiding in <strong id="nm-cd">3</strong>s…</div>
        </div>`;

      let count = Math.max(2, level);
      const interval = setInterval(() => {
        count--;
        const cdEl = container.querySelector('#nm-cd');
        if (cdEl) cdEl.textContent = count;
        if (count <= 0) { clearInterval(interval); inputPhase(); }
      }, 1000);
    }

    function inputPhase() {
      phase = 'input';
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;max-width:500px;margin:auto">
          <div style="display:flex;gap:32px;font-size:0.9rem">
            <span>Level: <strong style="color:var(--cyan)">${level}</strong></span>
            <span>Lives: <strong style="color:var(--pink)">${'❤️'.repeat(lives)}</strong></span>
          </div>
          <p style="color:#94a3b8;font-size:0.9rem">Type the number you saw:</p>
          <div class="nm-display" id="nm-display" style="color:rgba(6,182,212,0.3);letter-spacing:${Math.max(4,12-level)}px">${'?'.repeat(level)}</div>
          <div class="nm-input-area">
            <input class="nm-input" id="nm-input" type="number" inputmode="numeric" placeholder="Type number…" autocomplete="off" />
            <button class="btn-primary" id="nm-submit">✓ Submit</button>
          </div>
          <p style="font-size:0.78rem;color:#475569">Press Enter or click Submit</p>
        </div>`;

      const inp = container.querySelector('#nm-input');
      const submitBtn = container.querySelector('#nm-submit');
      inp.focus();

      const submit = () => {
        const val = inp.value.trim();
        if (!val) return;
        check(val);
      };
      submitBtn.addEventListener('click', submit);
      inp.addEventListener('keydown', e => { if(e.key==='Enter') submit(); });
    }

    function check(val) {
      const correct = val === currentNumber;
      if (correct) {
        level++;
        onScore(level * 50);
        showResult(true);
      } else {
        lives--;
        showResult(false);
      }
    }

    function showResult(won) {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;max-width:500px;margin:auto;text-align:center">
          <div style="font-size:3rem">${won ? '✅' : '❌'}</div>
          <h3 style="font-size:1.3rem;font-weight:700;color:${won?'var(--green)':'#ef4444'}">${won ? 'Correct!' : 'Wrong!'}</h3>
          ${!won ? `<p style="color:#94a3b8">The number was: <strong style="color:var(--cyan)">${currentNumber}</strong></p>` : ''}
          <div style="display:flex;gap:32px;font-size:0.9rem">
            <span>Level: <strong style="color:var(--cyan)">${won?level:level-1||1}</strong></span>
            <span>Lives: <strong style="color:var(--pink)">${'❤️'.repeat(Math.max(0,lives))}</strong></span>
          </div>
          ${lives > 0 ? `<button class="btn-primary" id="nm-next">${won ? '▶ Next Level' : '🔄 Try Again'}</button>` : `<p style="color:#ef4444">No lives left! Press Restart.</p>`}
        </div>`;

      const nextBtn = container.querySelector('#nm-next');
      if (nextBtn) nextBtn.addEventListener('click', () => { if (!won) {} nextRound(); });
      if (lives <= 0) onScore((level-1||1) * 50);
    }

    start();
    return { restart: start };
  }
};
