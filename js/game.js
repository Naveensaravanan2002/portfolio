/* ═══════════════════════════════════════════════════════════════
   game.js — Brick Breaker, canvas rebuild of the Java Swing game
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 640, H = 460;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.aspectRatio = W + ' / ' + H;
  ctx.scale(dpr, dpr);

  const overlay = document.getElementById('gameOverlay');
  const scoreEl = document.getElementById('gameScore');
  const livesEl = document.getElementById('gameLives');
  const bricksEl = document.getElementById('gameBricks');
  const startBtn = document.getElementById('gameStart');
  const resetBtn = document.getElementById('gameReset');

  const BG = '#06281F';
  const CREAM = '#FBF7EC';
  const ROW_COLORS = ['#E4582B', '#DFA32B', '#D7BAFF'];
  const PADDLE = { w: 98, h: 12, y: H - 32, x: (W - 98) / 2, speed: 560 };
  const BALL = { x: W / 2, y: H - 60, r: 7, vx: 0, vy: 0, launched: false, speed: 330 };
  const BRICK = { cols: 7, rows: 3, offsetX: 34, offsetY: 54, gap: 9, h: 26 };

  let bricks = [];
  let brickW = 0;
  let score = 0;
  let lives = 3;
  let state = 'idle';       // idle | running | over | won
  let paused = false;
  let visible = true;
  let last = 0;
  let particles = [];
  const keys = { left: false, right: false };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const speedOf = () => Math.hypot(BALL.vx, BALL.vy);

  function buildBricks() {
    brickW = (W - BRICK.offsetX * 2 - BRICK.gap * (BRICK.cols - 1)) / BRICK.cols;
    bricks = [];
    for (let r = 0; r < BRICK.rows; r++) {
      for (let c = 0; c < BRICK.cols; c++) {
        bricks.push({
          x: BRICK.offsetX + c * (brickW + BRICK.gap),
          y: BRICK.offsetY + r * (BRICK.h + BRICK.gap),
          w: brickW,
          h: BRICK.h,
          alive: true,
          color: ROW_COLORS[r % ROW_COLORS.length]
        });
      }
    }
  }

  function resetBall() {
    BALL.launched = false;
    BALL.vx = 0; BALL.vy = 0;
    BALL.x = PADDLE.x + PADDLE.w / 2;
    BALL.y = PADDLE.y - BALL.r - 2;
  }

  function updateHud() {
    if (scoreEl) scoreEl.textContent = String(score).padStart(3, '0');
    if (livesEl) livesEl.textContent = String(lives);
    if (bricksEl) bricksEl.textContent = String(bricks.filter(b => b.alive).length);
  }

  function showOverlay(kicker, title, sub) {
    if (!overlay) return;
    overlay.innerHTML =
      `<p class="mono">${kicker}</p>` +
      `<p class="arcade__overlay-title">${title}</p>` +
      `<p class="mono arcade__overlay-sub">${sub}</p>`;
    overlay.classList.remove('is-hidden');
  }
  function hideOverlay() {
    if (overlay) overlay.classList.add('is-hidden');
  }

  function resetGame(autoStart) {
    score = 0;
    lives = 3;
    paused = false;
    particles = [];
    PADDLE.x = (W - PADDLE.w) / 2;
    buildBricks();
    resetBall();
    updateHud();
    state = autoStart ? 'running' : 'idle';
    if (autoStart) {
      hideOverlay();
    } else {
      showOverlay('JAVA SWING / CANVAS', 'Press <em>Start</em>', '21 bricks · 3 lives · one paddle');
    }
  }

  function launch() {
    if (state !== 'running' || BALL.launched || paused) return;
    BALL.launched = true;
    const dir = Math.random() > 0.5 ? 1 : -1;
    BALL.vx = BALL.speed * 0.55 * dir;
    BALL.vy = -BALL.speed * 0.835;
  }

  function burst(x, y, color) {
    for (let i = 0; i < 12; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 210,
        vy: (Math.random() - 0.5) * 210 - 40,
        life: 0.55 + Math.random() * 0.35,
        max: 0.9,
        color,
        size: 2 + Math.random() * 3
      });
    }
    if (particles.length > 240) particles = particles.slice(-240);
  }

  function loseLife() {
    lives -= 1;
    updateHud();
    if (lives <= 0) {
      state = 'over';
      showOverlay('GAME OVER', `Score ${score}`, 'press Start to try again');
    } else {
      resetBall();
    }
  }

  /* ── update ─────────────────────────────────────────────────── */
  function update(dt) {
    if (keys.left) PADDLE.x -= PADDLE.speed * dt;
    if (keys.right) PADDLE.x += PADDLE.speed * dt;
    PADDLE.x = clamp(PADDLE.x, 6, W - 6 - PADDLE.w);

    if (!BALL.launched) {
      BALL.x = PADDLE.x + PADDLE.w / 2;
      BALL.y = PADDLE.y - BALL.r - 2;
    } else {
      BALL.x += BALL.vx * dt;
      BALL.y += BALL.vy * dt;

      if (BALL.x - BALL.r < 0) { BALL.x = BALL.r; BALL.vx = Math.abs(BALL.vx); }
      if (BALL.x + BALL.r > W) { BALL.x = W - BALL.r; BALL.vx = -Math.abs(BALL.vx); }
      if (BALL.y - BALL.r < 0) { BALL.y = BALL.r; BALL.vy = Math.abs(BALL.vy); }
      if (BALL.y - BALL.r > H) { loseLife(); return; }

      // paddle
      if (BALL.vy > 0 &&
          BALL.y + BALL.r >= PADDLE.y &&
          BALL.y - BALL.r < PADDLE.y + PADDLE.h &&
          BALL.x >= PADDLE.x - BALL.r &&
          BALL.x <= PADDLE.x + PADDLE.w + BALL.r) {
        const hit = clamp((BALL.x - (PADDLE.x + PADDLE.w / 2)) / (PADDLE.w / 2), -1, 1);
        const speed = clamp(speedOf() * 1.015, BALL.speed, 620);
        const angle = hit * 1.02;
        BALL.vx = Math.sin(angle) * speed;
        BALL.vy = -Math.abs(Math.cos(angle) * speed);
        BALL.y = PADDLE.y - BALL.r - 1;
      }

      // bricks
      for (const b of bricks) {
        if (!b.alive) continue;
        const cx = clamp(BALL.x, b.x, b.x + b.w);
        const cy = clamp(BALL.y, b.y, b.y + b.h);
        const dx = BALL.x - cx;
        const dy = BALL.y - cy;
        if (dx * dx + dy * dy <= BALL.r * BALL.r) {
          const prevY = BALL.y - BALL.vy * dt;
          if (prevY + BALL.r <= b.y || prevY - BALL.r >= b.y + b.h) BALL.vy = -BALL.vy;
          else BALL.vx = -BALL.vx;
          b.alive = false;
          score += 5;
          burst(b.x + b.w / 2, b.y + b.h / 2, b.color);
          updateHud();
          break;
        }
      }

      if (bricks.every(b => !b.alive)) {
        state = 'won';
        showOverlay('WALL CLEARED', `Score ${score}`, 'press Start to play again');
      }
    }

    for (const p of particles) {
      p.vy += 420 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    particles = particles.filter(p => p.life > 0);
  }

  /* ── draw ───────────────────────────────────────────────────── */
  function roundRect(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function draw() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(251,247,236,.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // bricks
    bricks.forEach(b => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      roundRect(b.x, b.y, b.w, b.h, 5);
      ctx.fill();
      ctx.fillStyle = 'rgba(251,247,236,.22)';
      roundRect(b.x + 2, b.y + 2, b.w - 4, 4, 2);
      ctx.fill();
    });

    // particles
    particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // paddle
    ctx.fillStyle = CREAM;
    roundRect(PADDLE.x, PADDLE.y, PADDLE.w, PADDLE.h, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(11,59,46,.35)';
    roundRect(PADDLE.x + PADDLE.w / 2 - 12, PADDLE.y + 4, 24, 4, 2);
    ctx.fill();

    // ball
    ctx.save();
    ctx.shadowColor = 'rgba(251,247,236,.75)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = CREAM;
    ctx.beginPath();
    ctx.arc(BALL.x, BALL.y, BALL.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // launch hint
    if (!BALL.launched && state === 'running') {
      ctx.fillStyle = 'rgba(251,247,236,.45)';
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS SPACE OR TAP TO LAUNCH', W / 2, PADDLE.y - 42);
    }
  }

  function loop(ts) {
    const dt = Math.min(0.032, (ts - last) / 1000 || 0);
    last = ts;
    if (state === 'running' && !paused && visible && !document.hidden) update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  /* ── controls ───────────────────────────────────────────────── */
  window.addEventListener('keydown', e => {
    if (!visible) return;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { keys.left = true; e.preventDefault(); }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { keys.right = true; e.preventDefault(); }
    if (e.code === 'Space') {
      e.preventDefault();
      if (state === 'idle' || state === 'over' || state === 'won') resetGame(true);
      launch();
    }
    if (e.code === 'KeyP' && state === 'running') {
      paused = !paused;
      if (paused) showOverlay('PAUSED', 'Take a breath', 'press P to resume');
      else hideOverlay();
    }
  });
  window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  });

  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (W / r.width);
    PADDLE.x = clamp(x - PADDLE.w / 2, 6, W - 6 - PADDLE.w);
  });
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (state === 'running') launch();
    else resetGame(true);
  });

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (state === 'running' && paused) { paused = false; hideOverlay(); return; }
      resetGame(true);
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => resetGame(false));
  }

  /* pause when the card is off-screen */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { visible = entry.isIntersecting; });
    }, { threshold: 0.15 });
    io.observe(canvas);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'running' && !paused) {
      paused = true;
      showOverlay('PAUSED', 'Take a breath', 'press P to resume');
    }
  });

  resetGame(false);
  requestAnimationFrame(loop);
})();
