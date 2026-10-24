/* ── Snake ── */
window.SnakeGame = {
  id: 'snake',
  init(container, onScore) {
    const CELL = 20, COLS = 20, ROWS = 20;
    const W = COLS * CELL, H = ROWS * CELL;
    let snake, dir, nextDir, food, score, speed, raf, running, gameOver;

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">
        <canvas id="snake-canvas" width="${W}" height="${H}" style="touch-action:none"></canvas>
        <p style="font-size:0.78rem;color:#64748b">Arrow keys / WASD to move · Swipe on mobile</p>
      </div>`;

    const canvas = container.querySelector('#snake-canvas');
    const ctx = canvas.getContext('2d');
    let touchStart = null;

    canvas.addEventListener('touchstart', e => {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchend', e => {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) > Math.abs(dy)) nextDir = dx > 0 ? {x:1,y:0} : {x:-1,y:0};
      else nextDir = dy > 0 ? {x:0,y:1} : {x:0,y:-1};
      touchStart = null;
    }, { passive: true });

    const keyMap = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
                     w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0} };
    const keyHandler = e => {
      if (keyMap[e.key]) { e.preventDefault(); const d = keyMap[e.key]; if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d; }
    };
    document.addEventListener('keydown', keyHandler);

    function randomFood() {
      let pos;
      do { pos = { x: Math.random()*COLS|0, y: Math.random()*ROWS|0 }; }
      while (snake.some(s => s.x===pos.x && s.y===pos.y));
      return pos;
    }

    function start() {
      snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
      dir = {x:1,y:0}; nextDir = {x:1,y:0};
      food = randomFood(); score = 0; speed = 150; running = true; gameOver = false;
      if (raf) cancelAnimationFrame(raf);
      loop();
    }

    let lastTime = 0;
    function loop(ts = 0) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (ts - lastTime < speed) return;
      lastTime = ts;
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || snake.some(s => s.x===head.x && s.y===head.y)) {
        running = false; gameOver = true; draw(); onScore(score); return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10; speed = Math.max(60, speed - 3);
        food = randomFood(); onScore(score);
      } else { snake.pop(); }
      draw();
    }

    function draw() {
      ctx.fillStyle = '#05071a'; ctx.fillRect(0,0,W,H);
      // Grid
      ctx.strokeStyle = 'rgba(99,102,241,0.05)';
      for (let x=0;x<COLS;x++) { ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,H); ctx.stroke(); }
      for (let y=0;y<ROWS;y++) { ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(W,y*CELL); ctx.stroke(); }
      // Food
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(food.x*CELL+CELL/2, food.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2);
      ctx.fill(); ctx.shadowBlur = 0;
      // Snake
      snake.forEach((seg, i) => {
        const ratio = i / snake.length;
        ctx.fillStyle = i === 0 ? '#06b6d4' : `hsl(${200 + ratio*60},80%,${60-ratio*20}%)`;
        ctx.shadowColor = i === 0 ? '#06b6d4' : 'transparent';
        ctx.shadowBlur = i === 0 ? 10 : 0;
        const pad = i === 0 ? 1 : 2;
        ctx.beginPath();
        ctx.roundRect(seg.x*CELL+pad, seg.y*CELL+pad, CELL-pad*2, CELL-pad*2, 4);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      // Score
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'bold 14px Outfit,sans-serif';
      ctx.fillText(`Score: ${score}`, 10, 24);
      if (gameOver) {
        ctx.fillStyle = 'rgba(5,7,26,0.8)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 32px Orbitron,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W/2, H/2-20);
        ctx.fillStyle = '#94a3b8'; ctx.font = '16px Outfit,sans-serif';
        ctx.fillText(`Score: ${score}`, W/2, H/2+20);
        ctx.fillText('Press Restart to play again', W/2, H/2+50);
        ctx.textAlign = 'left';
      }
    }

    start();
    return {
      restart: start,
      destroy() { running = false; if(raf) cancelAnimationFrame(raf); document.removeEventListener('keydown', keyHandler); }
    };
  }
};
