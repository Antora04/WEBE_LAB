/* ── Flappy Bird-style (FlappyZone) ── */
window.FlappyGame = {
  id: 'flappy',
  init(container, onScore) {
    const W = 400, H = 500;
    const GRAVITY = 0.45, FLAP = -8, GAP = 160, PIPE_W = 54, PIPE_SPEED = 2.8;

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">
        <canvas id="flappy-canvas" width="${W}" height="${H}" style="touch-action:none;cursor:pointer"></canvas>
        <p style="font-size:0.78rem;color:#64748b">Click / Space / Tap to flap wings</p>
      </div>`;

    const canvas = container.querySelector('#flappy-canvas');
    const ctx = canvas.getContext('2d');
    let bird, pipes, score, raf, running, gameState, bg_offset;

    function start() {
      bird = { x: 80, y: H/2, vy: 0, w: 36, h: 26, rot: 0 };
      pipes = []; score = 0; running = true; gameState = 'waiting'; bg_offset = 0;
      pipes.push(makePipe());
      if (raf) cancelAnimationFrame(raf);
      loop();
    }

    function makePipe() {
      const top = 80 + Math.random() * (H - GAP - 160);
      return { x: W + 10, top, bot: top + GAP, passed: false };
    }

    function flap() {
      if (gameState === 'waiting') { gameState = 'playing'; }
      if (gameState === 'playing') { bird.vy = FLAP; }
      if (gameState === 'over') { start(); }
    }

    const flapKey = e => { if (e.code === 'Space') { e.preventDefault(); flap(); } };
    canvas.addEventListener('click', flap);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); flap(); }, { passive: false });
    document.addEventListener('keydown', flapKey);

    function loop() {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      update(); draw();
    }

    function update() {
      bg_offset = (bg_offset + 0.5) % W;
      if (gameState !== 'playing') return;
      bird.vy += GRAVITY;
      bird.y += bird.vy;
      bird.rot = Math.max(-30, Math.min(90, bird.vy * 5));
      if (bird.y + bird.h/2 >= H || bird.y - bird.h/2 <= 0) { endGame(); return; }
      // Pipes
      if (pipes[pipes.length-1].x < W/2) pipes.push(makePipe());
      for (const p of pipes) {
        p.x -= PIPE_SPEED;
        // Collision
        const bx = bird.x - bird.w/2, by = bird.y - bird.h/2;
        if (bx + bird.w > p.x + 4 && bx < p.x + PIPE_W - 4) {
          if (by < p.top || by + bird.h > p.bot) { endGame(); return; }
        }
        if (!p.passed && p.x + PIPE_W < bird.x) { p.passed = true; score++; onScore(score * 10); }
      }
      pipes = pipes.filter(p => p.x > -PIPE_W - 10);
    }

    function endGame() { gameState = 'over'; onScore(score * 10); }

    function drawBird(x, y, rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot * Math.PI/180);
      // Body
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI*2); ctx.fill();
      // Wing
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      const wAnim = Math.sin(Date.now()*0.01) * 6;
      ctx.ellipse(-4, wAnim, 12, 7, -0.5, 0, Math.PI*2); ctx.fill();
      // Eye
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(10, -4, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(12, -4, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(13, -5, 1, 0, Math.PI*2); ctx.fill();
      // Beak
      ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(16,-1); ctx.lineTo(26,2); ctx.lineTo(16,5); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function drawPipe(p) {
      // Top pipe
      const grd = ctx.createLinearGradient(p.x, 0, p.x+PIPE_W, 0);
      grd.addColorStop(0,'#166534'); grd.addColorStop(0.5,'#15803d'); grd.addColorStop(1,'#166534');
      ctx.fillStyle = grd;
      ctx.fillRect(p.x, 0, PIPE_W, p.top);
      ctx.fillStyle = '#14532d';
      ctx.fillRect(p.x - 4, p.top - 20, PIPE_W + 8, 20);
      // Bottom pipe
      ctx.fillStyle = grd;
      ctx.fillRect(p.x, p.bot, PIPE_W, H - p.bot);
      ctx.fillStyle = '#14532d';
      ctx.fillRect(p.x - 4, p.bot, PIPE_W + 8, 20);
    }

    function draw() {
      // Sky gradient
      const sky = ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,'#0f172a'); sky.addColorStop(1,'#1e3a5f');
      ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);
      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      [[40,60],[120,30],[200,80],[300,40],[350,100],[80,150],[250,20]].forEach(([sx,sy]) => {
        ctx.beginPath(); ctx.arc((sx + bg_offset*0.3) % W, sy, 1.5, 0, Math.PI*2); ctx.fill();
      });
      // Ground
      ctx.fillStyle = '#92400e'; ctx.fillRect(0, H-40, W, 40);
      ctx.fillStyle = '#78350f'; ctx.fillRect(0, H-40, W, 8);
      // Grass bumps
      ctx.fillStyle = '#15803d';
      for (let gx = -bg_offset*2%20; gx < W+20; gx += 20) {
        ctx.beginPath(); ctx.arc(gx, H-40, 10, Math.PI, Math.PI*2); ctx.fill();
      }
      // Pipes
      pipes.forEach(drawPipe);
      // Bird
      drawBird(bird.x, bird.y, bird.rot);
      // Score
      ctx.fillStyle = '#fff'; ctx.font = 'bold 28px Orbitron,sans-serif'; ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 4;
      ctx.fillText(score, W/2, 60); ctx.shadowBlur = 0;
      // State messages
      if (gameState === 'waiting') {
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '18px Outfit,sans-serif';
        ctx.fillText('Tap or Click to Start!', W/2, H/2+60);
      }
      if (gameState === 'over') {
        ctx.fillStyle = 'rgba(5,7,26,0.75)'; ctx.fillRect(0,0,W,H); ctx.textAlign='center';
        ctx.fillStyle='#ef4444'; ctx.font='bold 30px Orbitron,sans-serif'; ctx.fillText('GAME OVER',W/2,H/2-20);
        ctx.fillStyle='#94a3b8'; ctx.font='16px Outfit,sans-serif'; ctx.fillText(`Score: ${score}`,W/2,H/2+18);
        ctx.fillText('Tap to restart',W/2,H/2+50);
      }
      ctx.textAlign = 'left';
    }

    start();
    return {
      restart: start,
      destroy() { running=false; if(raf) cancelAnimationFrame(raf); document.removeEventListener('keydown',flapKey); }
    };
  }
};
