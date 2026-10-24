/* =======================================================
   GameZone Portal — script.js
   Main portal logic: navigation, game registry, search,
   filters, favourites, leaderboard, localStorage
   ======================================================= */

'use strict';

/* ── Game Registry ──────────────────────────────────────
   Add new games here. The id must match the window.GameXxx.id
   ─────────────────────────────────────────────────────── */
const GAMES = [
  {
    id: 'spaceshooter', title: 'Space Shooter', category: 'action',
    icon: '🚀', desc: 'Blast alien enemies, dodge bullets, and rack up the highest score!',
    controls: 'Arrow keys / WASD to move · Space to shoot · Touch sides on mobile',
    popularity: 98, isNew: false, isTrending: true, isEditorPick: true, isFeatured: true,
    module: 'SpaceShooter'
  },
  {
    id: 'snake', title: 'Snake', category: 'arcade',
    icon: '🐍', desc: 'Eat food, grow longer, and avoid crashing into yourself!',
    controls: 'Arrow keys / WASD to move · Swipe on mobile',
    popularity: 95, isNew: false, isTrending: true, isEditorPick: false, isFeatured: false,
    module: 'SnakeGame'
  },
  {
    id: 'breakout', title: 'Breakout', category: 'arcade',
    icon: '🟦', desc: 'Destroy all the bricks with your ball and paddle before running out of lives!',
    controls: 'Mouse / Touch to move paddle · Click or Space to launch',
    popularity: 90, isNew: false, isTrending: false, isEditorPick: true, isFeatured: false,
    module: 'Breakout'
  },
  {
    id: 'flappy', title: 'FlappyZone', category: 'arcade',
    icon: '🐦', desc: 'Tap to flap through gaps in the pipes and beat your high score!',
    controls: 'Click / Space / Tap to flap',
    popularity: 92, isNew: true, isTrending: true, isEditorPick: false, isFeatured: false,
    module: 'FlappyGame'
  },
  {
    id: 'game2048', title: '2048', category: 'puzzle',
    icon: '🔢', desc: 'Combine numbered tiles to reach the 2048 tile!',
    controls: 'Arrow keys / WASD to slide · Swipe on mobile',
    popularity: 96, isNew: false, isTrending: true, isEditorPick: true, isFeatured: false,
    module: 'Game2048'
  },
  {
    id: 'wordguess', title: 'Word Guess', category: 'puzzle',
    icon: '💬', desc: 'Guess the 5-letter word in 6 attempts. Green = correct, Yellow = wrong position!',
    controls: 'On-screen keyboard or physical keyboard',
    popularity: 88, isNew: true, isTrending: false, isEditorPick: true, isFeatured: false,
    module: 'WordGuess'
  },
  {
    id: 'tictactoe', title: 'Tic-Tac-Toe', category: 'classic',
    icon: '⭕', desc: 'Classic two-player game. Get three in a row to win!',
    controls: 'Click cells to place X or O',
    popularity: 85, isNew: false, isTrending: false, isEditorPick: false, isFeatured: false,
    module: 'TicTacToe'
  },
  {
    id: 'memory', title: 'Memory Match', category: 'brain',
    icon: '🃏', desc: 'Flip cards to find matching emoji pairs. Test your memory!',
    controls: 'Click / tap cards to flip them',
    popularity: 82, isNew: false, isTrending: false, isEditorPick: false, isFeatured: false,
    module: 'MemoryMatch'
  },
  {
    id: 'sudoku', title: 'Sudoku', category: 'brain',
    icon: '🔣', desc: 'Fill the 9×9 grid so every row, column, and 3×3 box has all digits 1–9.',
    controls: 'Click a cell, then tap a number on the numpad',
    popularity: 80, isNew: false, isTrending: false, isEditorPick: false, isFeatured: false,
    module: 'SudokuGame'
  },
  {
    id: 'minesweeper', title: 'Minesweeper', category: 'puzzle',
    icon: '💣', desc: 'Reveal tiles without hitting a mine. Right-click to flag suspected mines!',
    controls: 'Left-click: reveal · Right-click: flag',
    popularity: 78, isNew: false, isTrending: false, isEditorPick: false, isFeatured: false,
    module: 'Minesweeper'
  },
  {
    id: 'simon', title: 'Simon Says', category: 'brain',
    icon: '🟥', desc: 'Remember and repeat the growing colour sequence. How far can you go?',
    controls: 'Watch the sequence, then click the buttons in order',
    popularity: 75, isNew: false, isTrending: false, isEditorPick: false, isFeatured: false,
    module: 'SimonGame'
  },
  {
    id: 'sliding', title: 'Sliding Puzzle', category: 'puzzle',
    icon: '🧩', desc: 'Slide tiles into the correct numbered order by moving them into the blank space.',
    controls: 'Click a tile adjacent to the blank to slide it',
    popularity: 72, isNew: true, isTrending: false, isEditorPick: false, isFeatured: false,
    module: 'SlidingPuzzle'
  },
  {
    id: 'rps', title: 'Rock Paper Scissors', category: 'classic',
    icon: '✊', desc: 'Choose Rock, Paper, or Scissors and beat the CPU. First to 5 wins!',
    controls: 'Click your choice',
    popularity: 86, isNew: false, isTrending: false, isEditorPick: false, isFeatured: false,
    module: 'RockPaperScissors'
  },
  {
    id: 'whackamole', title: 'Whack-a-Mole', category: 'casual',
    icon: '🐹', desc: 'Smash as many moles as possible before the 30-second timer runs out!',
    controls: 'Click / tap moles as they appear',
    popularity: 84, isNew: false, isTrending: true, isEditorPick: false, isFeatured: false,
    module: 'WhackAMole'
  },
  {
    id: 'reactiontime', title: 'Reaction Time', category: 'casual',
    icon: '⚡', desc: 'Click as soon as the screen turns green. Test your reflexes in milliseconds!',
    controls: 'Click / tap the box when it turns green',
    popularity: 83, isNew: true, isTrending: false, isEditorPick: true, isFeatured: false,
    module: 'ReactionTime'
  },
  {
    id: 'numbermemory', title: 'Number Memory', category: 'brain',
    icon: '🔢', desc: 'Memorize and recall increasingly long numbers. Beat your best level!',
    controls: 'Memorize the number, then type it when prompted',
    popularity: 76, isNew: true, isTrending: false, isEditorPick: false, isFeatured: false,
    module: 'NumberMemory'
  }
];

/* ── State ───────────────────────────────────────────── */
let currentView = 'home';
let currentGameId = null;
let currentGameInstance = null;
let activeFilter = 'all';
let activeSortHome = 'default';
let activeFilterAll = 'all';
let activeSortAll = 'default';
let searchQuery = '';
let favourites = loadFavourites();
let highScores = loadHighScores();
let recentGames = loadRecent();

/* ── LocalStorage Helpers ────────────────────────────── */
function safeSave(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(_) {}
}
function safeLoad(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch(_) { return fallback; }
}
function loadFavourites() { return safeLoad('gz_favs', []); }
function saveFavourites() { safeSave('gz_favs', favourites); }
function loadHighScores() { return safeLoad('gz_scores', {}); }
function saveHighScores() { safeSave('gz_scores', highScores); }
function loadRecent() { return safeLoad('gz_recent', []); }
function saveRecent() { safeSave('gz_recent', recentGames); }

function recordRecentGame(id) {
  recentGames = [id, ...recentGames.filter(r => r !== id)].slice(0, 6);
  saveRecent();
}

function updateHighScore(id, score) {
  if (!highScores[id] || score > highScores[id]) {
    highScores[id] = score;
    saveHighScores();
  }
}

/* ── View Navigation ─────────────────────────────────── */
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(`view-${name}`);
  if (el) el.classList.add('active');
  currentView = name;
  // Update nav
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === name);
  });
  window.scrollTo(0, 0);
}

function navigateTo(section) {
  stopCurrentGame();
  switch (section) {
    case 'home': showView('home'); renderHome(); break;
    case 'categories': showView('all-games'); renderAllGames('all', 'Categories'); break;
    case 'new-games': showView('all-games'); renderAllGames('all', 'New Releases', g => g.isNew); break;
    case 'popular': showView('all-games'); renderAllGames('all', 'Popular Games'); break;
    case 'leaderboard': showView('leaderboard'); renderLeaderboard(); break;
    case 'about': showView('about'); break;
    default: showView('home'); renderHome(); break;
  }
}

/* ── Game Card Builder ───────────────────────────────── */
function makeCatClass(cat) {
  return `cat-${cat}`;
}

function buildGameCard(game) {
  const isFav = favourites.includes(game.id);
  const hs = highScores[game.id] || 0;
  const card = document.createElement('article');
  card.className = 'game-card' + (isFav ? ' is-fav' : '');
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Play ${game.title}`);
  card.dataset.gameId = game.id;

  card.innerHTML = `
    <div class="card-art">
      <div class="card-art-inner" style="${artStyle(game)}">${game.icon}</div>
    </div>
    <div class="card-fav-ribbon">❤️</div>
    <div class="card-body">
      <div class="card-badges">
        <span class="card-cat ${makeCatClass(game.category)}">${categoryLabel(game.category)}</span>
        ${game.isNew ? '<span style="font-size:0.65rem;background:rgba(16,185,129,0.2);color:#6ee7b7;padding:2px 8px;border-radius:50px;font-weight:700">NEW</span>' : ''}
        <button class="card-fav-btn ${isFav?'active':''}" data-fav-id="${game.id}" aria-label="${isFav?'Remove from':'Add to'} favourites" title="Favourite">${isFav?'❤️':'🤍'}</button>
      </div>
      <div class="card-title">${escText(game.title)}</div>
      <div class="card-desc">${escText(game.desc)}</div>
      <div class="card-footer">
        <button class="card-play-btn" data-play-id="${game.id}">▶ Play</button>
        ${hs > 0 ? `<span class="card-high-score">Best: ${hs}</span>` : ''}
      </div>
    </div>`;

  // Events
  card.querySelector('.card-play-btn').addEventListener('click', e => {
    e.stopPropagation();
    launchGame(game.id);
  });
  card.querySelector('.card-fav-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleFav(game.id, card);
  });
  card.addEventListener('click', () => launchGame(game.id));
  card.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); launchGame(game.id); } });

  return card;
}

function artStyle(game) {
  const gradients = {
    action: 'background:linear-gradient(135deg,#1a0a2e,#2d1557)',
    arcade: 'background:linear-gradient(135deg,#0a1a2e,#1a3a5e)',
    puzzle: 'background:linear-gradient(135deg,#0a1e2e,#0e3555)',
    brain: 'background:linear-gradient(135deg,#1a0a3e,#380a6e)',
    classic: 'background:linear-gradient(135deg,#0a2e1a,#0e5534)',
    casual: 'background:linear-gradient(135deg,#2e1a0a,#5e380e)',
  };
  return gradients[game.category] || gradients.puzzle;
}

function categoryLabel(cat) {
  const labels = { puzzle:'Puzzle', brain:'Brain', arcade:'Arcade', action:'Action', classic:'Classic', casual:'Casual' };
  return labels[cat] || cat;
}

function escText(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ── Render Grids ────────────────────────────────────── */
function renderGrid(containerId, games) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  games.forEach(g => el.appendChild(buildGameCard(g)));
}

function filterAndSort(games, filter, sort, extra) {
  let g = filter === 'all' ? [...games] : games.filter(x => x.category === filter);
  if (extra) g = g.filter(extra);
  if (sort === 'name') g.sort((a,b) => a.title.localeCompare(b.title));
  if (sort === 'popularity') g.sort((a,b) => b.popularity - a.popularity);
  return g;
}

/* ── Home View ────────────────────────────────────────── */
function renderHome() {
  renderFeaturedPreview();
  renderContinuePlaying();
  renderGrid('trending-grid', GAMES.filter(g => g.isTrending).slice(0, 4));
  renderGrid('popular-grid', [...GAMES].sort((a,b) => b.popularity - a.popularity).slice(0, 4));
  renderGrid('new-grid', GAMES.filter(g => g.isNew).slice(0, 4));
  renderGrid('picks-grid', GAMES.filter(g => g.isEditorPick).slice(0, 4));
  renderSidebar();
  updateFavCount();
}

function renderFeaturedPreview() {
  const featured = GAMES.find(g => g.isFeatured) || GAMES[0];
  const art = document.getElementById('featured-art');
  const title = document.getElementById('featured-title');
  const desc = document.getElementById('featured-desc');
  if (art) art.style.cssText = `${artStyle(featured)};display:flex;align-items:center;justify-content:center;font-size:5rem;height:200px`;
  if (art) art.textContent = featured.icon;
  if (title) title.textContent = featured.title;
  if (desc) desc.textContent = featured.desc;
  document.getElementById('hero-play-btn').onclick = () => launchGame(featured.id);
  document.getElementById('hero-browse-btn').onclick = () => navigateTo('categories');
}

function renderContinuePlaying() {
  const section = document.getElementById('continue-section');
  const grid = document.getElementById('continue-grid');
  if (!recentGames.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  grid.innerHTML = '';
  recentGames.map(id => GAMES.find(g => g.id === id)).filter(Boolean)
    .forEach(g => grid.appendChild(buildGameCard(g)));
}

function renderSidebar() {
  renderSidebarLeaderboard();
  renderSidebarFavs();
}

function renderSidebarLeaderboard() {
  const el = document.getElementById('sidebar-leaderboard');
  if (!el) return;
  const entries = Object.entries(highScores)
    .map(([id,score]) => ({ game: GAMES.find(g=>g.id===id), score }))
    .filter(e => e.game)
    .sort((a,b) => b.score - a.score)
    .slice(0, 5);
  if (!entries.length) {
    el.innerHTML = '<p class="empty-state-sm">Play games to see your scores here!</p>';
    return;
  }
  el.innerHTML = entries.map((e,i) => `
    <div class="lb-row">
      <span class="lb-rank">${i+1}</span>
      <span class="lb-game">${escText(e.game.title)}</span>
      <span class="lb-score">${e.score}</span>
    </div>`).join('');
}

function renderSidebarFavs() {
  const el = document.getElementById('sidebar-fav-list');
  if (!el) return;
  const favGames = favourites.map(id => GAMES.find(g => g.id === id)).filter(Boolean);
  if (!favGames.length) {
    el.innerHTML = '<p class="empty-state-sm">No favourites yet. Click ♡ on any game card.</p>';
    return;
  }
  el.innerHTML = favGames.map(g => `
    <div class="fav-item" data-fav-play="${g.id}">
      <span class="fav-item-icon">${g.icon}</span>
      <span>${escText(g.title)}</span>
    </div>`).join('');
  el.querySelectorAll('.fav-item').forEach(item => {
    item.addEventListener('click', () => launchGame(item.dataset.favPlay));
  });
}

/* ── All Games View ────────────────────────────────────── */
function renderAllGames(filter = 'all', title = 'All Games', extra = null) {
  document.getElementById('view-all-title').textContent = title;
  activeFilterAll = filter;
  // Sync filter chips
  document.querySelectorAll('#view-all-games .fchip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.cat === filter);
  });
  const sort = document.getElementById('filter-sort')?.value || 'default';
  const query = document.getElementById('filter-search')?.value?.trim().toLowerCase() || '';
  let games = filterAndSort(GAMES, filter, sort, extra);
  if (query) games = games.filter(g => g.title.toLowerCase().includes(query));
  renderGrid('all-games-grid', games);
  document.getElementById('empty-state').style.display = games.length ? 'none' : '';
}

/* ── Leaderboard View ─────────────────────────────────── */
function renderLeaderboard() {
  const el = document.getElementById('leaderboard-full');
  const categories = ['action','arcade','puzzle','brain','classic','casual'];
  let html = '';
  categories.forEach(cat => {
    const catGames = GAMES.filter(g => g.category === cat);
    const rows = catGames.map(g => {
      const hs = highScores[g.id];
      return { game: g, score: hs || 0 };
    });
    if (!rows.length) return;
    html += `
      <div class="lb-table-wrap">
        <div class="lb-table-title">${categoryLabel(cat)} Games</div>
        <table class="lb-table">
          <thead><tr><th>#</th><th>Game</th><th>Your Best</th></tr></thead>
          <tbody>
            ${rows.map((r,i) => `
              <tr>
                <td><span class="lb-medal">${['🥇','🥈','🥉'][i]||i+1}</span></td>
                <td>${r.game.icon} ${escText(r.game.title)}</td>
                <td style="color:var(--orange);font-weight:700">${r.score || '—'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  });
  el.innerHTML = html;
}

/* ── Favourites ──────────────────────────────────────── */
function toggleFav(gameId, cardEl) {
  if (favourites.includes(gameId)) {
    favourites = favourites.filter(f => f !== gameId);
  } else {
    favourites.push(gameId);
  }
  saveFavourites();
  updateFavCount();
  // Update card
  if (cardEl) {
    const isFav = favourites.includes(gameId);
    cardEl.classList.toggle('is-fav', isFav);
    const btn = cardEl.querySelector('.card-fav-btn');
    if (btn) { btn.textContent = isFav ? '❤️' : '🤍'; btn.classList.toggle('active', isFav); }
  }
  renderSidebarFavs();
}

function updateFavCount() {
  const el = document.getElementById('fav-count');
  if (el) el.textContent = favourites.length;
}

/* ── Game Launch ─────────────────────────────────────── */
function stopCurrentGame() {
  if (currentGameInstance?.destroy) currentGameInstance.destroy();
  currentGameInstance = null;
  currentGameId = null;
  // Hide overlay
  const overlay = document.getElementById('game-overlay');
  if (overlay) overlay.style.display = 'none';
}

function launchGame(gameId) {
  const game = GAMES.find(g => g.id === gameId);
  if (!game) return;
  stopCurrentGame();
  currentGameId = gameId;
  recordRecentGame(gameId);

  // Set up game view UI
  document.getElementById('game-view-title').textContent = game.title;
  const catEl = document.getElementById('game-view-cat');
  catEl.textContent = categoryLabel(game.category);
  catEl.className = `game-view-cat ${makeCatClass(game.category)}`;
  document.getElementById('game-instructions').textContent = `📖 Controls: ${game.controls}`;
  document.getElementById('current-score').textContent = '0';
  document.getElementById('best-score').textContent = highScores[gameId] || '0';
  // Extra score bar
  document.getElementById('extra-score-item').style.display = 'none';

  const isFav = favourites.includes(gameId);
  const favBtn = document.getElementById('game-fav-btn');
  favBtn.textContent = isFav ? '❤️ Unfavourite' : '♡ Favourite';
  favBtn.className = 'btn-small fav-btn' + (isFav ? ' is-fav' : '');

  // Clear game container
  const container = document.getElementById('game-container');
  container.innerHTML = '';
  document.getElementById('game-overlay').style.display = 'none';

  showView('game');

  // Instantiate game module
  const module = window[game.module];
  if (!module) { container.innerHTML = '<p style="color:#ef4444">Game module not found.</p>'; return; }

  currentGameInstance = module.init(container, (score) => {
    document.getElementById('current-score').textContent = score;
    updateHighScore(gameId, score);
    document.getElementById('best-score').textContent = highScores[gameId] || score;
  });

  // Restart button
  document.getElementById('game-restart-btn').onclick = () => {
    document.getElementById('game-overlay').style.display = 'none';
    if (currentGameInstance?.restart) currentGameInstance.restart();
    else launchGame(gameId);
    document.getElementById('current-score').textContent = '0';
  };

  // Fav button
  favBtn.onclick = () => {
    toggleFav(gameId, null);
    const iF = favourites.includes(gameId);
    favBtn.textContent = iF ? '❤️ Unfavourite' : '♡ Favourite';
    favBtn.className = 'btn-small fav-btn' + (iF ? ' is-fav' : '');
  };
}

function showGameOverlay(icon, title, msg) {
  document.getElementById('overlay-icon').textContent = icon;
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('overlay-msg').textContent = msg;
  document.getElementById('game-overlay').style.display = 'flex';
}

/* ── Search ──────────────────────────────────────────── */
const searchInput = document.getElementById('search-input');
const searchDropdown = document.getElementById('search-dropdown');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { searchDropdown.innerHTML = ''; return; }
    const results = GAMES.filter(g => g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q)).slice(0, 8);
    if (!results.length) {
      searchDropdown.innerHTML = '<div style="padding:12px 16px;font-size:0.8rem;color:#64748b">No games found</div>';
      return;
    }
    searchDropdown.innerHTML = results.map(g => `
      <div class="search-result-item" data-sid="${g.id}">
        <span class="search-result-icon">${g.icon}</span>
        <div><div style="font-weight:600">${escText(g.title)}</div><div style="font-size:0.72rem;color:#64748b">${categoryLabel(g.category)}</div></div>
      </div>`).join('');
    searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        searchInput.value = '';
        searchDropdown.innerHTML = '';
        launchGame(item.dataset.sid);
      });
    });
  });
  // Close dropdown on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrapper')) searchDropdown.innerHTML = '';
  });
}

/* ── Category Chips (Home) ───────────────────────────── */
document.querySelectorAll('.cat-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const cat = chip.dataset.cat;
    // Filter the visible sections
    const sections = ['trending-grid','popular-grid','new-grid','picks-grid'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.querySelectorAll('.game-card').forEach(card => {
        const gameId = card.dataset.gameId;
        const game = GAMES.find(g => g.id === gameId);
        card.style.display = (cat === 'all' || game?.category === cat) ? '' : 'none';
      });
    });
  });
});

// Sort
document.getElementById('sort-select')?.addEventListener('change', e => {
  activeSortHome = e.target.value;
  renderHome();
});

/* ── All Games Filters ───────────────────────────────── */
document.querySelectorAll('#view-all-games .fchip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#view-all-games .fchip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderAllGames(chip.dataset.cat);
  });
});
document.getElementById('filter-search')?.addEventListener('input', () => renderAllGames(activeFilterAll));
document.getElementById('filter-sort')?.addEventListener('change', () => renderAllGames(activeFilterAll));

/* ── Navigation ──────────────────────────────────────── */
document.querySelectorAll('[data-section]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(el.dataset.section);
    // Close mobile nav if open
    closeMobileNav();
  });
});

// Back button
document.getElementById('back-btn').addEventListener('click', () => {
  stopCurrentGame();
  navigateTo('home');
});
// Overlay buttons
document.getElementById('overlay-restart').addEventListener('click', () => {
  document.getElementById('game-overlay').style.display = 'none';
  if (currentGameInstance?.restart) currentGameInstance.restart();
  else if (currentGameId) launchGame(currentGameId);
});
document.getElementById('overlay-back').addEventListener('click', () => {
  stopCurrentGame();
  navigateTo('home');
});

/* ── Mobile Nav ──────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const overlay = document.getElementById('mobile-nav-overlay');

function closeMobileNav() {
  overlay.classList.remove('open');
  hamburger.setAttribute('aria-expanded','false');
}

hamburger.addEventListener('click', () => {
  overlay.classList.add('open');
  hamburger.setAttribute('aria-expanded','true');
});
document.getElementById('close-mobile-nav').addEventListener('click', closeMobileNav);
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    closeMobileNav();
    navigateTo(link.dataset.section);
  });
});

/* ── Fav Toggle Button ───────────────────────────────── */
document.getElementById('fav-toggle-btn').addEventListener('click', () => {
  showView('all-games');
  document.getElementById('view-all-title').textContent = '❤️ My Favourites';
  const grid = document.getElementById('all-games-grid');
  grid.innerHTML = '';
  const favGames = favourites.map(id => GAMES.find(g => g.id === id)).filter(Boolean);
  favGames.forEach(g => grid.appendChild(buildGameCard(g)));
  document.getElementById('empty-state').style.display = favGames.length ? 'none' : '';
});

/* ── Header scroll effect ────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('site-header').classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ── Contact Form ────────────────────────────────────── */
document.getElementById('contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  let valid = true;
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const msg = document.getElementById('contact-msg').value.trim();
  const nameErr = document.getElementById('name-error');
  const emailErr = document.getElementById('email-error');
  const msgErr = document.getElementById('msg-error');

  nameErr.textContent = '';
  emailErr.textContent = '';
  msgErr.textContent = '';

  if (!name) { nameErr.textContent = 'Name is required.'; valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { emailErr.textContent = 'Valid email required.'; valid = false; }
  if (!msg || msg.length < 10) { msgErr.textContent = 'Message must be at least 10 characters.'; valid = false; }

  if (valid) {
    document.getElementById('form-success').style.display = '';
    e.target.reset();
  }
});

/* ── Logo home ───────────────────────────────────────── */
document.getElementById('logo-home').addEventListener('click', e => {
  e.preventDefault();
  stopCurrentGame();
  navigateTo('home');
});

/* ── Keyboard: prevent scroll when game active ────────── */
window.addEventListener('keydown', e => {
  if (currentView === 'game' && ['ArrowUp','ArrowDown','Space'].includes(e.code)) {
    e.preventDefault();
  }
}, { passive: false });

/* ── Art for hero featured preview ──────────────────────*/
function drawFeaturedArt() {
  const featured = GAMES.find(g => g.isFeatured) || GAMES[0];
  const previewArt = document.getElementById('featured-art');
  if (previewArt) {
    previewArt.style.cssText = `${artStyle(featured)};height:200px;display:flex;align-items:center;justify-content:center;font-size:5rem`;
    previewArt.textContent = featured.icon;
  }
}

/* ── Init ────────────────────────────────────────────── */
function init() {
  renderHome();
  updateFavCount();
  drawFeaturedArt();
}

init();
