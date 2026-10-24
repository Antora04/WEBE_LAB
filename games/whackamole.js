/* ── Whack-a-Mole ── */
window.WhackAMole = {
  id: 'whackamole',
  init(container, onScore) {
    const GAME_DURATION = 30000, MOLES = 9;
    let score, activeMoles, timer, timerInterval, moleInterval, gameActive, timeLeft;

    function start() {
      score = 0; activeMoles = new Set(); gameActive = true; timeLeft = GAME_DURATION;
      clearInterval(timerInterval); clearInterval(moleInterval);

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%">
          <div style="display:flex;gap:32px;font-size:0.9rem">
            <span>Score: <strong id="wam-score" style="color:var(--cyan)">0</strong></span>
            <span>Time: <strong id="wam-time" style="color:var(--orange)">30s</strong></span>
          </div>
          <div class="wam-timer-bar"><div class="wam-timer-fill" id="wam-fill" style="width:100%"></div></div>
          <div class="wam-grid" id="wam-grid"></div>
          <p style="font-size:0.78rem;color:#64748b">Click the moles before they disappear!</p>
        </div>`;

      const grid = container.querySelector('#wam-grid');
      for (let i = 0; i < MOLES; i++) {
        const hole = document.createElement('div');
        hole.className = 'wam-hole';
        hole.dataset.idx = i;
        hole.setAttribute('role','button');
        hole.setAttribute('aria-label','Mole hole');
        hole.addEventListener('click', () => whack(i));
        hole.addEventListener('touchstart', e => { e.preventDefault(); whack(i); }, { passive: false });
        grid.appendChild(hole);
      }

      // Pop moles
      const popMole = () => {
        if (!gameActive) return;
        const available = Array.from({length:MOLES},(_,i)=>i).filter(i=>!activeMoles.has(i));
        if (!available.length) return;
        const idx = available[Math.random()*available.length|0];
        activeMoles.add(idx);
        const hole = grid.children[idx];
        hole.textContent = '🐹';
        hole.classList.add('active');
        setTimeout(() => {
          if (activeMoles.has(idx)) { activeMoles.delete(idx); hole.textContent=''; hole.classList.remove('active'); }
        }, 800 + Math.random() * 600);
      };
      moleInterval = setInterval(popMole, 500);

      // Countdown
      timerInterval = setInterval(() => {
        timeLeft -= 100;
        const frac = timeLeft / GAME_DURATION;
        const fill = container.querySelector('#wam-fill');
        const timeEl = container.querySelector('#wam-time');
        if (fill) fill.style.width = (frac*100)+'%';
        if (timeEl) timeEl.textContent = Math.ceil(timeLeft/1000)+'s';
        if (timeLeft <= 0) { endGame(); }
      }, 100);
    }

    function whack(idx) {
      if (!gameActive || !activeMoles.has(idx)) return;
      activeMoles.delete(idx);
      const hole = container.querySelector(`#wam-grid`).children[idx];
      hole.textContent = '💥';
      hole.classList.remove('active'); hole.classList.add('hit');
      score += 10;
      container.querySelector('#wam-score').textContent = score;
      onScore(score);
      setTimeout(() => { hole.textContent=''; hole.classList.remove('hit'); }, 300);
    }

    function endGame() {
      gameActive = false;
      clearInterval(timerInterval); clearInterval(moleInterval);
      onScore(score);
    }

    start();
    return { restart: start };
  }
};
