/* ── Memory Match ── */
window.MemoryMatch = {
  id: 'memory',
  init(container, onScore) {
    const emojis = ['🎮','🕹️','🎯','🏆','⚡','🔥','💎','🌙','🚀','🎲','🌈','🦄'];
    let cards = [], flipped = [], matched = 0, moves = 0, timer = 0, timerInterval = null, locked = false;

    function shuffle(arr) {
      const a = [...arr]; for (let i = a.length-1; i > 0; i--) { const j = Math.random()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]]; } return a;
    }

    function startTimer() {
      timerInterval = setInterval(() => {
        timer++;
        const el = container.querySelector('#mem-timer');
        if (el) el.textContent = timer + 's';
      }, 1000);
    }

    function init() {
      cards = shuffle([...emojis, ...emojis]);
      flipped = []; matched = 0; moves = 0; timer = 0; locked = false;
      clearInterval(timerInterval);

      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%">
          <div style="display:flex;gap:32px;font-size:0.9rem">
            <span>Moves: <strong id="mem-moves" style="color:var(--cyan)">0</strong></span>
            <span>Time: <strong id="mem-timer" style="color:var(--orange)">0s</strong></span>
            <span>Pairs: <strong id="mem-pairs" style="color:var(--green)">0/12</strong></span>
          </div>
          <div class="memory-grid" id="memory-grid" style="grid-template-columns:repeat(6,1fr);max-width:480px;"></div>
        </div>`;

      const grid = container.querySelector('#memory-grid');
      cards.forEach((emoji, i) => {
        const card = document.createElement('div');
        card.className = 'mem-card';
        card.dataset.index = i;
        card.dataset.emoji = emoji;
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Memory card');
        card.innerHTML = `<div class="mem-card-inner"><div class="mem-card-front">?</div><div class="mem-card-back">${emoji}</div></div>`;
        card.addEventListener('click', () => handleFlip(card, i));
        card.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') handleFlip(card,i); });
        grid.appendChild(card);
      });

      startTimer();
    }

    function handleFlip(card, i) {
      if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      if (flipped.length === 0) {} // first flip is always ok
      card.classList.add('flipped');
      flipped.push({ card, i, emoji: cards[i] });

      if (flipped.length === 2) {
        locked = true;
        moves++;
        container.querySelector('#mem-moves').textContent = moves;
        setTimeout(checkMatch, 700);
      }
    }

    function checkMatch() {
      const [a, b] = flipped;
      if (a.emoji === b.emoji) {
        a.card.classList.add('matched');
        b.card.classList.add('matched');
        matched++;
        container.querySelector('#mem-pairs').textContent = `${matched}/12`;
        if (matched === 12) {
          clearInterval(timerInterval);
          const score = Math.max(10, 1000 - moves * 10 - timer * 5);
          onScore(score);
        }
      } else {
        a.card.classList.remove('flipped');
        b.card.classList.remove('flipped');
      }
      flipped = [];
      locked = false;
    }

    init();
    return { restart: init };
  }
};
