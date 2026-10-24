/* ── Rock Paper Scissors ── */
window.RockPaperScissors = {
  id: 'rps',
  init(container, onScore) {
    const CHOICES = ['✊','✌️','🖐️'];
    const NAMES = ['Rock','Paper','Scissors'];
    let playerScore = 0, cpuScore = 0, rounds = 0;

    function start() {
      playerScore = 0; cpuScore = 0; rounds = 0;
      render();
    }

    function render() {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;max-width:500px;margin:auto">
          <div class="rps-score-display">
            <span>You: <strong id="rps-ps" style="color:var(--cyan)">0</strong></span>
            <span>Round: <strong id="rps-rd" style="color:var(--violet)">0</strong></span>
            <span>CPU: <strong id="rps-cs" style="color:var(--pink)">0</strong></span>
          </div>
          <div class="rps-arena">
            <div class="rps-player-area">
              <p style="font-size:0.8rem;color:#64748b;margin-bottom:8px">You</p>
              <div class="rps-choice-display" id="rps-player-choice">❓</div>
            </div>
            <div class="rps-vs">VS</div>
            <div class="rps-player-area">
              <p style="font-size:0.8rem;color:#64748b;margin-bottom:8px">CPU</p>
              <div class="rps-choice-display" id="rps-cpu-choice">❓</div>
            </div>
          </div>
          <div class="rps-result" id="rps-result"></div>
          <div class="rps-buttons">
            ${CHOICES.map((c,i) => `<button class="rps-btn" data-idx="${i}" title="${NAMES[i]}" aria-label="${NAMES[i]}">${c}</button>`).join('')}
          </div>
          <p style="font-size:0.75rem;color:#475569">First to 5 wins!</p>
        </div>`;

      container.querySelectorAll('.rps-btn').forEach(btn => {
        btn.addEventListener('click', () => play(parseInt(btn.dataset.idx)));
      });
    }

    function play(playerIdx) {
      const cpuIdx = Math.random()*3|0;
      rounds++;
      const pEl = container.querySelector('#rps-player-choice');
      const cEl = container.querySelector('#rps-cpu-choice');
      const res = container.querySelector('#rps-result');
      pEl.textContent = CHOICES[playerIdx];
      cEl.textContent = CHOICES[cpuIdx];
      pEl.className = 'rps-choice-display';
      cEl.className = 'rps-choice-display';

      let msg, winner;
      if (playerIdx === cpuIdx) {
        msg = "🤝 It's a Draw!"; winner = 'draw';
      } else if ((playerIdx - cpuIdx + 3) % 3 === 1) {
        msg = `🎉 ${NAMES[playerIdx]} beats ${NAMES[cpuIdx]}! You Win!`;
        playerScore++; winner = 'player';
      } else {
        msg = `😞 ${NAMES[cpuIdx]} beats ${NAMES[playerIdx]}! CPU Wins.`;
        cpuScore++; winner = 'cpu';
      }

      if (winner === 'player') { pEl.classList.add('win'); cEl.classList.add('lose'); }
      else if (winner === 'cpu') { cEl.classList.add('win'); pEl.classList.add('lose'); }

      res.textContent = msg;
      container.querySelector('#rps-ps').textContent = playerScore;
      container.querySelector('#rps-cs').textContent = cpuScore;
      container.querySelector('#rps-rd').textContent = rounds;
      onScore(playerScore * 10);

      if (playerScore >= 5 || cpuScore >= 5) {
        res.textContent += (playerScore >= 5 ? ' 🏆 You win the match!' : ' 💻 CPU wins the match!');
        container.querySelectorAll('.rps-btn').forEach(b => b.disabled = true);
      }
    }

    start();
    return { restart: start };
  }
};
