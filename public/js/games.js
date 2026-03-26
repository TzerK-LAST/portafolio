/* ============================================================
   TzerK Portfolio — Games JS
   Snake · Memory · Typing Speed Test
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════
   TAB SWITCHING
   ══════════════════════════════════════════════════════════ */
document.querySelectorAll('.game-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById('game-' + tab.dataset.game);
    if (target) target.classList.add('active');
    if (tab.dataset.game === 'typing') {
      const inp = document.getElementById('typing-input');
      if (inp) setTimeout(() => inp.focus(), 60);
    }
  });
});

/* ══════════════════════════════════════════════════════════
   GAME 1 — SNAKE
   ══════════════════════════════════════════════════════════ */
(function () {
  const canvas   = document.getElementById('snake-canvas');
  if (!canvas) return;
  const ctx      = canvas.getContext('2d');
  const CELL = 18, COLS = 22, ROWS = 22;
  canvas.width  = COLS * CELL;
  canvas.height = ROWS * CELL;

  const scoreEl  = document.getElementById('snake-score');
  const highEl   = document.getElementById('snake-high');
  const levelEl  = document.getElementById('snake-level');
  const startBtn = document.getElementById('snake-start');

  let snake, dir, nextDir, food, special, score, level, interval, running = false;
  let highScore = parseInt(localStorage.getItem('snakeHigh') || '0');
  highEl.textContent = highScore;

  function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

  function placeFood() {
    do { food = { x: rand(0, COLS - 1), y: rand(0, ROWS - 1) }; }
    while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function placeSpecial() {
    do { special = { x: rand(0, COLS - 1), y: rand(0, ROWS - 1), timer: 60 }; }
    while (snake.some(s => s.x === special.x && s.y === special.y));
  }

  function hud() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    if (score > highScore) {
      highScore = score;
      highEl.textContent = highScore;
      localStorage.setItem('snakeHigh', highScore);
    }
  }

  function draw() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,canvas.height); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(canvas.width,y*CELL); ctx.stroke(); }

    // Food
    ctx.save();
    ctx.shadowBlur = 18; ctx.shadowColor = '#ffd700'; ctx.fillStyle = '#ffd700';
    rr(ctx, food.x*CELL+2, food.y*CELL+2, CELL-4, CELL-4, 4);
    ctx.restore();

    // Special
    if (special) {
      const p = Math.abs(Math.sin(Date.now()*0.008))*0.5+0.5;
      ctx.save();
      ctx.shadowBlur = 20*p; ctx.shadowColor = '#f97316'; ctx.fillStyle = '#f97316'; ctx.globalAlpha = 0.7+0.3*p;
      rr(ctx, special.x*CELL+1, special.y*CELL+1, CELL-2, CELL-2, 5);
      ctx.restore();
    }

    // Snake
    snake.forEach((seg, i) => {
      const head = i === 0;
      ctx.save();
      ctx.shadowBlur  = head ? 14 : 6;
      ctx.shadowColor = head ? '#00ffff' : '#a855f7';
      ctx.fillStyle   = head ? '#00ffff' : ['#a855f7','#c084fc','#d8b4fe'][Math.min(i,2)];
      ctx.globalAlpha = head ? 1 : Math.max(0.45, 1 - i*0.04);
      rr(ctx, seg.x*CELL+1, seg.y*CELL+1, CELL-2, CELL-2, 4);
      ctx.restore();
    });
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x,y,w,h,r); else ctx.rect(x,y,w,h);
    ctx.fill();
  }

  function tick() {
    dir = { ...nextDir };
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return gameOver();
    if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10 * level;
      level  = Math.floor(score / 80) + 1;
      hud(); placeFood();
      if (score % 50 === 0 && !special) placeSpecial();
      clearInterval(interval);
      interval = setInterval(tick, Math.max(80, 220 - level*18));
    } else if (special && head.x === special.x && head.y === special.y) {
      score += 30 * level; special = null; hud();
      snake.push({ ...snake[snake.length-1] });
    } else {
      snake.pop();
    }
    if (special) { special.timer--; if (special.timer <= 0) special = null; }
    draw();
  }

  function gameOver() {
    clearInterval(interval); running = false;
    startBtn.textContent = 'Play Again';
    ctx.fillStyle = 'rgba(168,85,247,0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Orbitron,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 16);
    ctx.font = '12px JetBrains Mono,monospace'; ctx.fillStyle = '#00ffff';
    ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 12);
  }

  function startSnake() {
    snake   = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    dir     = {x:1,y:0}; nextDir = {x:1,y:0};
    score   = 0; level = 1; special = null;
    running = true;
    startBtn.textContent = 'Restart';
    hud(); placeFood();
    clearInterval(interval);
    interval = setInterval(tick, 220);
    draw();
  }

  startBtn.addEventListener('click', startSnake);

  const KEYS = {
    ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
    w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0},
    W:{x:0,y:-1}, S:{x:0,y:1}, A:{x:-1,y:0}, D:{x:1,y:0},
  };
  document.addEventListener('keydown', e => {
    if (!running) return;
    const d = KEYS[e.key];
    if (!d || (d.x === -dir.x && d.y === -dir.y)) return;
    nextDir = d;
    if (e.key.startsWith('Arrow')) e.preventDefault();
  });

  [['btn-up',{x:0,y:-1}],['btn-down',{x:0,y:1}],['btn-left',{x:-1,y:0}],['btn-right',{x:1,y:0}]].forEach(([id,d]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => { if (running && !(d.x===-dir.x && d.y===-dir.y)) nextDir = d; });
  });

  // Idle screen
  ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#a855f7'; ctx.font = 'bold 15px Orbitron,sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('Press Start', canvas.width/2, canvas.height/2);
})();

/* ══════════════════════════════════════════════════════════
   GAME 2 — MEMORY
   ══════════════════════════════════════════════════════════ */
(function () {
  const grid       = document.getElementById('memory-grid');
  const movesEl    = document.getElementById('memory-moves');
  const pairsEl    = document.getElementById('memory-pairs');
  const timeEl     = document.getElementById('memory-time');
  const winBanner  = document.getElementById('memory-win');
  const resultEl   = document.getElementById('memory-result');
  const restartBtn = document.getElementById('memory-restart');
  if (!grid) return;

  const EMOJIS = ['🚀','🌟','🎮','💡','🔥','🎯','⚡','🌈'];
  let flipped = [], matched = 0, moves = 0, seconds = 0, timerInt = null, locked = false;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildGrid() {
    clearInterval(timerInt);
    const cards = shuffle([...EMOJIS, ...EMOJIS]);
    grid.innerHTML = '';
    flipped = []; matched = 0; moves = 0; seconds = 0; locked = false;
    winBanner.classList.add('hidden');
    updateHUD();

    timerInt = setInterval(() => {
      seconds++;
      timeEl.textContent = seconds + 's';
    }, 1000);

    cards.forEach(emoji => {
      const card = document.createElement('div');
      card.className = 'mem-card';
      card.dataset.emoji = emoji;
      card.innerHTML = `
        <div class="mem-face mem-front">❓</div>
        <div class="mem-face mem-back">${emoji}</div>`;

      card.addEventListener('click', () => {
        if (locked) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        card.classList.add('flipped');
        flipped.push(card);
        if (flipped.length === 2) checkMatch();
      });

      grid.appendChild(card);
    });
  }

  function checkMatch() {
    locked = true;
    moves++;
    movesEl.textContent = moves;
    const [a, b] = flipped;
    if (a.dataset.emoji === b.dataset.emoji) {
      a.classList.add('matched');
      b.classList.add('matched');
      matched++;
      pairsEl.textContent = matched + '/8';
      flipped = [];
      locked  = false;
      if (matched === 8) victory();
    } else {
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        flipped = [];
        locked  = false;
      }, 900);
    }
  }

  function victory() {
    clearInterval(timerInt);
    winBanner.classList.remove('hidden');
    resultEl.textContent = `${moves} moves · ${seconds}s`;
    if (typeof confetti !== 'undefined') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 }, colors: ['#a855f7','#00ffff','#ffd700'] });
    }
  }

  function updateHUD() {
    movesEl.textContent = moves;
    pairsEl.textContent = matched + '/8';
    timeEl.textContent  = '0s';
  }

  restartBtn.addEventListener('click', buildGrid);
  buildGrid();
})();

/* ══════════════════════════════════════════════════════════
   GAME 3 — TYPING SPEED TEST
   ══════════════════════════════════════════════════════════ */
(function () {
  const textBox    = document.getElementById('typing-text');
  const input      = document.getElementById('typing-input');
  const wpmEl      = document.getElementById('typing-wpm');
  const accEl      = document.getElementById('typing-accuracy');
  const timerEl    = document.getElementById('typing-timer');
  const restartBtn = document.getElementById('typing-restart');
  if (!textBox || !input) return;

  const SENTENCES = [
    "The quick brown fox jumps over the lazy dog.",
    "Code is like humor. When you have to explain it, it is bad.",
    "First, solve the problem. Then, write the code.",
    "Programming is not about what you know. It is about what you can figure out.",
    "The best error message is the one that never shows up.",
    "Good code is its own best documentation.",
    "Simplicity is the soul of efficiency.",
    "Clean code always looks like it was written by someone who cares.",
    "Any fool can write code that a computer can understand.",
    "It works on my machine.",
  ];

  let sentence = '', typed = '', startTime = null, timerInt = null;
  let timeLeft = 60, started = false, correctChars = 0, totalChars = 0;

  function pick() { return SENTENCES[Math.floor(Math.random() * SENTENCES.length)]; }

  function render() {
    textBox.innerHTML = sentence.split('').map((ch, i) => {
      const t = typed[i];
      let cls = '';
      if (i === typed.length) cls = 'current';
      else if (t === ch) cls = 'correct';
      else if (t !== undefined) cls = 'wrong';
      return `<span class="char ${cls}">${ch === ' ' ? '&nbsp;' : ch}</span>`;
    }).join('');
  }

  function wpm() {
    if (!startTime) return 0;
    const elapsed = (60 - timeLeft) || 0.016;
    return Math.round((correctChars / 5) / (elapsed / 60));
  }

  function accuracy() {
    return totalChars === 0 ? 100 : Math.round((correctChars / totalChars) * 100);
  }

  function initGame() {
    sentence     = pick();
    typed        = '';
    startTime    = null;
    timeLeft     = 60;
    started      = false;
    correctChars = 0;
    totalChars   = 0;
    clearInterval(timerInt);
    input.value       = '';
    input.disabled    = false;
    input.placeholder = 'Start typing here...';
    wpmEl.textContent   = '0';
    accEl.textContent   = '100%';
    timerEl.textContent = '60s';
    render();
  }

  input.addEventListener('input', () => {
    if (input.disabled) return;

    if (!started) {
      started   = true;
      startTime = Date.now();
      timerInt  = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft + 's';
        wpmEl.textContent   = wpm();
        accEl.textContent   = accuracy() + '%';
        if (timeLeft <= 0) endGame();
      }, 1000);
    }

    typed        = input.value;
    totalChars   = typed.length;
    correctChars = typed.split('').filter((ch, i) => ch === sentence[i]).length;
    render();
    wpmEl.textContent = wpm();
    accEl.textContent = accuracy() + '%';

    // All chars typed correctly → load next sentence
    if (typed === sentence) {
      sentence    = pick();
      input.value = '';
      typed       = '';
      render();
    }
  });

  function endGame() {
    clearInterval(timerInt);
    input.disabled = true;
    const w = wpm(), a = accuracy();
    textBox.innerHTML = `
      <div style="text-align:center;padding:1.5rem">
        <div style="font-size:2rem;margin-bottom:.5rem">${w > 60 ? '🔥' : w > 40 ? '👍' : '📖'}</div>
        <div style="font-size:1.1rem;font-weight:700;color:#a855f7;margin-bottom:.4rem">${w} WPM</div>
        <div style="font-size:.8rem;color:#00ffff;margin-bottom:.25rem">${a}% accuracy</div>
        <div style="font-size:.7rem;color:#666;font-family:'JetBrains Mono',monospace">
          ${w > 60 ? 'Blazing fast!' : w > 40 ? 'Good speed!' : 'Keep practicing!'}
        </div>
      </div>`;
    if (w >= 50 && typeof confetti !== 'undefined') {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 }, colors: ['#a855f7','#00ffff','#ffd700'] });
    }
  }

  restartBtn.addEventListener('click', initGame);
  initGame();
})();
