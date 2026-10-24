/* ── Simon Memory Game ── */
window.SimonGame = {
  id: 'simon',
  init(container, onScore) {
    const COLORS = ['red','blue','green','yellow'];
    const SOUNDS = { red: 261.6, blue: 329.6, green: 392, yellow: 523.3 };
    let sequence, playerSeq, level, accepting, animating;
    let audioCtx = null;

    function getAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    }

    function playTone(freq, dur = 0.3) {
      try {
        const ctx = getAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.start(); osc.stop(ctx.currentTime + dur);
      } catch(_) {}
    }

    function lightBtn(color, dur = 400) {
      return new Promise(resolve => {
        const btn = container.querySelector(`.simon-btn[data-color="${color}"]`);
        if (btn) btn.classList.add('lit');
        playTone(SOUNDS[color], dur / 1000);
        setTimeout(() => {
          if (btn) btn.classList.remove('lit');
          resolve();
        }, dur);
      });
    }

    async function playSequence() {
      animating = true; accepting = false;
      for (const color of sequence) {
        await lightBtn(color);
        await new Promise(r => setTimeout(r, 200));
      }
      animating = false; accepting = true;
      setStatus(`Your turn — repeat ${sequence.length} step${sequence.length>1?'s':''}`, 'var(--cyan)');
    }

    function setStatus(msg, color = '#94a3b8') {
      const el = container.querySelector('#simon-status');
      if (el) { el.textContent = msg; el.style.color = color; }
      const lv = container.querySelector('#simon-level');
      if (lv) lv.textContent = level;
    }

    function start() {
      sequence = []; playerSeq = []; level = 0; accepting = false; animating = false;
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%">
          <div style="font-size:0.9rem;color:#94a3b8">Level: <strong id="simon-level" style="color:var(--cyan)">0</strong></div>
          <div class="simon-board">
            ${COLORS.map(c => `<button class="simon-btn" data-color="${c}" aria-label="${c} button"></button>`).join('')}
          </div>
          <div class="simon-status" id="simon-status" style="color:#94a3b8">Press Start to play</div>
          <button class="btn-primary" id="simon-start-btn">▶ Start</button>
        </div>`;

      container.querySelector('#simon-start-btn').addEventListener('click', nextRound);
      container.querySelectorAll('.simon-btn').forEach(btn => {
        btn.addEventListener('click', () => handlePlayerInput(btn.dataset.color));
      });
    }

    async function nextRound() {
      container.querySelector('#simon-start-btn').style.display = 'none';
      playerSeq = [];
      level++;
      sequence.push(COLORS[Math.random() * 4 | 0]);
      setStatus('Watch carefully…', 'var(--orange)');
      await new Promise(r => setTimeout(r, 500));
      await playSequence();
    }

    async function handlePlayerInput(color) {
      if (!accepting || animating) return;
      await lightBtn(color, 200);
      playerSeq.push(color);
      const idx = playerSeq.length - 1;
      if (playerSeq[idx] !== sequence[idx]) {
        accepting = false;
        playTone(100, 0.5);
        setStatus(`❌ Wrong! You reached level ${level}. Press restart.`, '#ef4444');
        onScore(level * 10);
        return;
      }
      if (playerSeq.length === sequence.length) {
        setStatus('✅ Correct!', 'var(--green)');
        onScore(level * 10);
        await new Promise(r => setTimeout(r, 800));
        nextRound();
      }
    }

    start();
    return { restart: start };
  }
};
