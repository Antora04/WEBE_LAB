/* ── Breakout ── */
window.Breakout = {
  id: 'breakout',
  init(container, onScore) {
    const W = 480, H = 420;
    let canvas, ctx, paddle, ball, bricks, score, lives, raf, running, gameState;
    const PAD_W = 80, PAD_H = 12, BALL_R = 8;
    const BRICK_ROWS = 5, BRICK_COLS = 8, BRICK_H = 22, BRICK_GAP = 6;
    const BRICK_W = (W - 40 - (BRICK_COLS-1)*BRICK_GAP) / BRICK_COLS;
    const BRICK_COLORS = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6'];

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">
        <canvas id="breakout-canvas" width="${W}" height="${H}" style="touch-action:none;cursor:none"></canvas>
        <p style="font-size:0.78rem;color:#64748b">Mouse/touch to move paddle · Click or Space to launch</p>
      </div>`;

    canvas = container.querySelector('#breakout-canvas');
    ctx = canvas.getContext('2d');

    function initBricks() {
      bricks = [];
      for (let r = 0; r < BRICK_ROWS; r++) for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({ x: 20 + c*(BRICK_W+BRICK_GAP), y: 50+r*(BRICK_H+BRICK_GAP), w: BRICK_W, h: BRICK_H, alive: true, color: BRICK_COLORS[r] });
      }
    }

    function start() {
      paddle = { x: W/2-PAD_W/2, y: H-30, w: PAD_W, h: PAD_H };
      ball = { x: W/2, y: H-60, vx: 3, vy: -4, r: BALL_R, launched: false };
      score = 0; lives = 3; gameState = 'playing'; running = true;
      initBricks();
      if (raf) cancelAnimationFrame(raf);
      loop();
    }

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const scale = W / rect.width;
      paddle.x = Math.max(0, Math.min(W-paddle.w, (e.clientX - rect.left) * scale - paddle.w/2));
      if (!ball.launched) ball.x = paddle.x + paddle.w/2;
    });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scale = W / rect.width;
      paddle.x = Math.max(0, Math.min(W-paddle.w, (e.touches[0].clientX - rect.left) * scale - paddle.w/2));
      if (!ball.launched) ball.x = paddle.x + paddle.w/2;
    }, { passive: false });
    const launch = () => { if (!ball.launched && gameState === 'playing') ball.launched = true; };
    canvas.addEventListener('click', launch);
    const spaceHandler = e => { if (e.code === 'Space') { e.preventDefault(); launch(); } };
    document.addEventListener('keydown', spaceHandler);

    function loop() {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      update(); draw();
    }

    function update() {
      if (gameState !== 'playing') return;
      if (!ball.launched) return;
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; }
      if (ball.x + ball.r > W) { ball.x = W-ball.r; ball.vx *= -1; }
      if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; }
      if (ball.y + ball.r > H) {
        lives--;
        if (lives <= 0) { gameState = 'over'; onScore(score); }
        else { ball.x = paddle.x+paddle.w/2; ball.y = paddle.y-ball.r-2; ball.vx = 3*(Math.random()>0.5?1:-1); ball.vy=-4; ball.launched=false; }
        return;
      }
      // Paddle
      if (ball.y+ball.r >= paddle.y && ball.y-ball.r <= paddle.y+paddle.h && ball.x >= paddle.x && ball.x <= paddle.x+paddle.w) {
        ball.vy = -Math.abs(ball.vy);
        ball.vx = ((ball.x - (paddle.x+paddle.w/2)) / (paddle.w/2)) * 5;
      }
      // Bricks
      for (const b of bricks) {
        if (!b.alive) continue;
        if (ball.x+ball.r>b.x && ball.x-ball.r<b.x+b.w && ball.y+ball.r>b.y && ball.y-ball.r<b.y+b.h) {
          b.alive = false; score += 10; ball.vy *= -1;
          onScore(score);
          if (bricks.every(br => !br.alive)) { gameState = 'win'; onScore(score + 200); }
          break;
        }
      }
    }

    function draw() {
      ctx.fillStyle = '#05071a'; ctx.fillRect(0,0,W,H);
      // HUD
      ctx.fillStyle = '#94a3b8'; ctx.font = '14px Outfit,sans-serif';
      ctx.fillText(`Score: ${score}`, 10, 28);
      ctx.fillText(`Lives: ${'❤️'.repeat(lives)}`, W-110, 28);
      // Bricks
      bricks.forEach(b => {
        if (!b.alive) return;
        ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 4); ctx.fill();
      });
      ctx.shadowBlur = 0;
      // Paddle
      const grad = ctx.createLinearGradient(paddle.x, 0, paddle.x+paddle.w, 0);
      grad.addColorStop(0,'#6366f1'); grad.addColorStop(1,'#06b6d4');
      ctx.fillStyle = grad; ctx.shadowColor = '#6366f1'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6); ctx.fill();
      ctx.shadowBlur = 0;
      // Ball
      ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      if (!ball.launched && gameState === 'playing') {
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '14px Outfit,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Click or Space to launch!', W/2, H/2+60); ctx.textAlign='left';
      }
      if (gameState === 'over') { drawOverlay('💥 GAME OVER', `Score: ${score}`, '#ef4444'); }
      if (gameState === 'win') { drawOverlay('🏆 YOU WIN!', `Score: ${score} — All bricks cleared!`, '#10b981'); }
    }

    function drawOverlay(title, msg, color) {
      ctx.fillStyle = 'rgba(5,7,26,0.85)'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle = color; ctx.font = 'bold 28px Orbitron,sans-serif'; ctx.textAlign='center';
      ctx.fillText(title, W/2, H/2-20);
      ctx.fillStyle = '#94a3b8'; ctx.font = '15px Outfit,sans-serif';
      ctx.fillText(msg, W/2, H/2+20);
      ctx.fillText('Press Restart to play again', W/2, H/2+50);
      ctx.textAlign='left';
    }

    start();
    return {
      restart: start,
      destroy() { running=false; if(raf) cancelAnimationFrame(raf); document.removeEventListener('keydown',spaceHandler); }
    };
  }
};
