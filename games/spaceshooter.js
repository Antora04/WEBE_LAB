/* ── Space Shooter ── */
window.SpaceShooter = {
  id: 'spaceshooter',
  init(container, onScore) {
    const W = 480, H = 520;
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">
        <canvas id="ss-canvas" width="${W}" height="${H}" style="touch-action:none"></canvas>
        <p style="font-size:0.78rem;color:#64748b">Arrow/WASD to move · Space to shoot · Tap sides to move on mobile</p>
      </div>`;

    const canvas = container.querySelector('#ss-canvas');
    const ctx = canvas.getContext('2d');
    let player, bullets, enemies, particles, stars, score, lives, raf, running, gameState, spawnTimer, shootTimer;
    const keys = {};

    const keyDown = e => {
      keys[e.code] = true;
      if (e.code === 'Space') { e.preventDefault(); tryShoot(); }
    };
    const keyUp = e => { keys[e.code] = false; };
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    // Touch
    let touchX = null;
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      touchX = (e.touches[0].clientX - rect.left) * (W / rect.width);
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      touchX = (e.touches[0].clientX - rect.left) * (W / rect.width);
    }, { passive: false });
    canvas.addEventListener('touchend', () => { touchX = null; tryShoot(); });

    function start() {
      player = { x: W/2, y: H-70, w: 36, h: 40, speed: 5, shootCooldown: 0 };
      bullets = []; enemies = []; particles = [];
      stars = Array.from({length:80}, () => ({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.5+0.3, speed:Math.random()*1.5+0.5 }));
      score = 0; lives = 3; gameState = 'playing'; running = true; spawnTimer = 0; shootTimer = 0;
      if (raf) cancelAnimationFrame(raf);
      loop();
    }

    let lastTS = 0, shootAuto = 0;
    function loop(ts = 0) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      const dt = Math.min(ts - lastTS, 50); lastTS = ts;
      update(dt); draw();
    }

    function tryShoot() {
      if (gameState !== 'playing') return;
      if (player.shootCooldown > 0) return;
      bullets.push({ x: player.x, y: player.y - 20, w: 4, h: 14, vy: -10 });
      player.shootCooldown = 12;
    }

    function spawnEnemy() {
      const type = Math.random() < 0.7 ? 'basic' : 'tank';
      enemies.push({ x: 30 + Math.random()*(W-60), y: -30, w: 30, h: 30, vy: type==='tank'?1.5:2.5, hp: type==='tank'?2:1, type });
    }

    function addParticles(x, y, color, count = 10) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 1, color, r: 2+Math.random()*3 });
      }
    }

    function update(dt) {
      // Player move
      const mv = player.speed;
      if (keys['ArrowLeft'] || keys['KeyA']) player.x = Math.max(player.w/2, player.x - mv);
      if (keys['ArrowRight'] || keys['KeyD']) player.x = Math.min(W-player.w/2, player.x + mv);
      if (keys['ArrowUp'] || keys['KeyW']) player.y = Math.max(player.h/2+40, player.y - mv);
      if (keys['ArrowDown'] || keys['KeyS']) player.y = Math.min(H-player.h/2, player.y + mv);
      if (touchX !== null) player.x += (touchX - player.x) * 0.12;
      if (player.shootCooldown > 0) player.shootCooldown--;
      // Auto-fire
      shootAuto++;
      if (shootAuto > 18) { tryShoot(); shootAuto = 0; }
      // Bullets
      bullets = bullets.filter(b => {
        b.y += b.vy;
        return b.y > -20;
      });
      // Enemies
      spawnTimer++;
      if (spawnTimer > Math.max(40, 90 - score/5)) { spawnEnemy(); spawnTimer = 0; }
      enemies = enemies.filter(e => {
        e.y += e.vy;
        // Hit player
        if (Math.abs(e.x-player.x)<(e.w+player.w)/2 && Math.abs(e.y-player.y)<(e.h+player.h)/2) {
          addParticles(e.x, e.y, '#ef4444');
          lives--;
          if (lives <= 0) { gameState='over'; onScore(score); }
          return false;
        }
        if (e.y > H+20) return false;
        // Bullet collision
        let hit = false;
        bullets = bullets.filter(b => {
          if (!hit && b.x > e.x-e.w/2 && b.x < e.x+e.w/2 && b.y > e.y-e.h/2 && b.y < e.y+e.h/2) {
            e.hp--; hit = e.hp <= 0;
            if (e.hp <= 0) { addParticles(e.x, e.y, e.type==='tank'?'#f59e0b':'#6366f1', 15); score += e.type==='tank'?20:10; onScore(score); return false; }
            return false;
          }
          return true;
        });
        return !hit;
      });
      // Particles
      particles = particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.05;
        return p.life > 0;
      });
      // Stars
      stars.forEach(s => { s.y = (s.y + s.speed) % H; });
    }

    function drawPlayer(x, y) {
      ctx.save(); ctx.translate(x, y);
      // Thruster
      ctx.fillStyle = `rgba(251,191,36,${0.5+Math.random()*0.5})`;
      ctx.beginPath(); ctx.ellipse(0, 24, 8, 10+Math.random()*4, 0, 0, Math.PI*2); ctx.fill();
      // Body
      const g = ctx.createLinearGradient(0,-20,0,20);
      g.addColorStop(0,'#6366f1'); g.addColorStop(1,'#06b6d4');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(18,18); ctx.lineTo(-18,18); ctx.closePath(); ctx.fill();
      // Cockpit
      ctx.fillStyle = '#bfdbfe'; ctx.beginPath(); ctx.ellipse(0, -4, 8, 10, 0, 0, Math.PI*2); ctx.fill();
      // Wings
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath(); ctx.moveTo(18,18); ctx.lineTo(30,24); ctx.lineTo(18,8); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-18,18); ctx.lineTo(-30,24); ctx.lineTo(-18,8); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function drawEnemy(e) {
      ctx.save(); ctx.translate(e.x, e.y);
      const color = e.type === 'tank' ? '#f59e0b' : '#ef4444';
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(14, -14); ctx.lineTo(-14, -14); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      if (e.hp > 1) {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Outfit'; ctx.textAlign = 'center';
        ctx.fillText('★', 0, 4);
      }
      ctx.restore();
    }

    function draw() {
      ctx.fillStyle = '#05071a'; ctx.fillRect(0,0,W,H);
      // Stars
      stars.forEach(s => {
        ctx.fillStyle = `rgba(255,255,255,${0.2+s.r/3})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
      });
      // Bullets
      bullets.forEach(b => {
        const bg = ctx.createLinearGradient(b.x, b.y, b.x, b.y+b.h);
        bg.addColorStop(0,'#06b6d4'); bg.addColorStop(1,'transparent');
        ctx.fillStyle = bg; ctx.shadowColor='#06b6d4'; ctx.shadowBlur=8;
        ctx.fillRect(b.x-b.w/2, b.y, b.w, b.h); ctx.shadowBlur=0;
      });
      // Enemies
      enemies.forEach(drawEnemy);
      // Player
      if (gameState !== 'over') drawPlayer(player.x, player.y);
      // Particles
      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      // HUD
      ctx.fillStyle='#94a3b8'; ctx.font='14px Outfit,sans-serif'; ctx.textAlign='left';
      ctx.fillText(`Score: ${score}`, 12, 28);
      ctx.fillText(`Lives: ${'❤️'.repeat(Math.max(0,lives))}`, W-110, 28);
      if (gameState === 'over') {
        ctx.fillStyle='rgba(5,7,26,0.85)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#ef4444'; ctx.font='bold 28px Orbitron,sans-serif'; ctx.textAlign='center';
        ctx.fillText('GAME OVER', W/2, H/2-20);
        ctx.fillStyle='#94a3b8'; ctx.font='16px Outfit,sans-serif';
        ctx.fillText(`Final Score: ${score}`, W/2, H/2+18);
        ctx.fillText('Press Restart to play again', W/2, H/2+50);
        ctx.textAlign='left';
      }
    }

    start();
    return {
      restart: start,
      destroy() { running=false; if(raf) cancelAnimationFrame(raf); document.removeEventListener('keydown',keyDown); document.removeEventListener('keyup',keyUp); }
    };
  }
};
