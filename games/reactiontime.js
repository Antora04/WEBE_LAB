/* ── Reaction Time Test ── */
window.ReactionTime = {
  id: 'reactiontime',
  init(container, onScore) {
    let state = 'idle', startTime, timeout, best = null, attempts = [];

    function start() {
      state = 'idle'; attempts = [];
      render();
    }

    function render() {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;max-width:520px;margin:auto">
          <div class="reaction-box wait" id="reaction-box" role="button" tabindex="0" aria-label="Reaction area">
            <div id="reaction-icon" style="font-size:2.5rem">🔴</div>
            <div id="reaction-label">Click when it turns GREEN</div>
            <div class="reaction-time" id="reaction-time" style="display:none"></div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;font-size:0.85rem;width:100%">
            <div>Best: <strong id="rt-best" style="color:var(--orange)">${best ? best+'ms' : '—'}</strong></div>
            <div id="rt-history" style="color:#64748b;font-size:0.78rem"></div>
          </div>
        </div>`;

      const box = container.querySelector('#reaction-box');
      box.addEventListener('click', handleClick);
      box.addEventListener('keydown', e => { if(e.key===' '||e.key==='Enter') handleClick(); });
    }

    function handleClick() {
      const box = container.querySelector('#reaction-box');
      const icon = container.querySelector('#reaction-icon');
      const label = container.querySelector('#reaction-label');
      const timeEl = container.querySelector('#reaction-time');

      if (state === 'idle' || state === 'done') {
        // Start waiting phase
        state = 'waiting';
        box.className = 'reaction-box wait';
        icon.textContent = '🔴';
        label.textContent = 'Wait for green…';
        timeEl.style.display = 'none';
        clearTimeout(timeout);
        const delay = 1500 + Math.random() * 3500;
        timeout = setTimeout(() => {
          if (state !== 'waiting') return;
          state = 'ready';
          box.className = 'reaction-box ready';
          icon.textContent = '🟢';
          label.textContent = 'CLICK NOW!';
          startTime = performance.now();
        }, delay);
      } else if (state === 'waiting') {
        // Too early
        clearTimeout(timeout);
        state = 'idle';
        box.className = 'reaction-box wait';
        icon.textContent = '😬';
        label.textContent = 'Too early! Click to try again.';
      } else if (state === 'ready') {
        const rt = Math.round(performance.now() - startTime);
        attempts.push(rt);
        if (!best || rt < best) { best = rt; }
        state = 'done';
        box.className = 'reaction-box done';
        icon.textContent = rt < 200 ? '⚡' : rt < 300 ? '✅' : '🐢';
        label.textContent = rt < 200 ? 'Lightning fast!' : rt < 300 ? 'Great!' : 'Keep practicing!';
        timeEl.style.display = 'block';
        timeEl.textContent = rt + 'ms';
        container.querySelector('#rt-best').textContent = best + 'ms';
        container.querySelector('#rt-history').textContent = `Attempts: ${attempts.slice(-5).join('ms, ')}ms`;
        // Score: lower is better, map to 0-1000
        const score = Math.max(0, Math.round(1000 - rt));
        onScore(score);
      }
    }

    start();
    return { restart: start };
  }
};
