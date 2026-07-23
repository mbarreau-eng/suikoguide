function renderSidebarControls() {
  const sidebar = document.querySelector('.sidebar') || document.getElementById('sidebar');
  if (!sidebar) return;

  // Ensure top header controls with Theme Switcher button exist
  let controlsContainer = document.getElementById('sidebar-controls');
  if (!controlsContainer) {
    controlsContainer = document.createElement('div');
    controlsContainer.id = 'sidebar-controls';
    controlsContainer.className = 'sidebar-controls';
    sidebar.insertBefore(controlsContainer, sidebar.lastChild);
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  controlsContainer.innerHTML = `
    <button id="theme-toggle-btn" class="theme-btn" onclick="toggleTheme()">
      ${currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  `;
}

// Render Sidebar Vertical Accordion
function renderSidebar() {
  const sidebar = document.getElementById('sidebar-nav') || document.getElementById('sidebar');
  if (!sidebar) return;

  const chapters = guideData.chapters || [];

  sidebar.innerHTML = `
    <nav class="sidebar-accordion">
      <!-- 1. Walkthrough Accordion Group -->
      <div class="accordion-group expanded" id="group-walkthrough">
        <button class="accordion-toggle" id="toggle-walkthrough">
          <span>📖 Walkthrough</span>
          <span class="accordion-arrow">▼</span>
        </button>
        
        <div class="accordion-menu" id="chapter-sub-menu">
          ${chapters.map(ch => {
            const label = typeof getChapterLabel === 'function' ? getChapterLabel(ch) : `Chapter ${ch.id}`;
            const isActive = String(ch.id) === String(currentChapterId);
            return `
              <a href="#" class="nav-item ${isActive ? 'active' : ''}" data-chapter-id="${ch.id}">
                ${label}
              </a>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2. Enemies View Button -->
      <button class="nav-btn-main" data-view="enemies">
        <span>👾 Enemies / Bestiary</span>
      </button>

      <!-- 3. Recruits View Button -->
      <button class="nav-btn-main" data-view="recruits">
        <span>★ Recruits</span>
      </button>
    </nav>
  `;
}

function renderContent() {
  const container = document.getElementById('main-container');
  container.innerHTML = '';

  if (activeTab === 'recruits') {
    renderRecruitsView(container);
  } else if (activeTab === 'walkthrough') {
    renderChapterView(container, currentChapterId);
  } else if (activeTab === 'enemies') {
    renderEnemiesView();
  }
}

function renderChapterView(container, chapterId) {
  const chapter = guideData.chapters.find(c => c.id === chapterId);
  if (!chapter) return;

  // 1. Chapter Header Card with metadata badges & recruits grid
  const header = document.createElement('div');
  header.className = 'chapter-header-card';
  const chapterBadgesHTML = renderBadges(chapter);
  const chapterRecruitsHTML = renderRecruitsSection(chapter);

// 1. Find Current Chapter Index & Objects
const chapters = guideData.chapters || [];
  const currentIndex = chapters.findIndex(
    ch => String(ch.id) === String(currentChapterId)
  );

  // Determine Prev / Next Chapters
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = (currentIndex >= 0 && currentIndex < chapters.length - 1) 
    ? chapters[currentIndex + 1] 
    : null;

  header.innerHTML = `
    <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--accent-gold); letter-spacing: 0.05em; font-weight: bold;">Chapter ${chapter.id}</div>
    <h2 class="chapter-title">${chapter.title}</h2>
    ${chapterBadgesHTML ? `<div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-color);">${chapterBadgesHTML}</div>` : ''}
    ${chapterRecruitsHTML}
  `;
  container.appendChild(header);

  // 2. Render Chapter-Level Party (if present)
  if (chapter.party && Array.isArray(chapter.party) && chapter.party.length > 0) {
    const partyCard = createPartyCard(chapter.party, 'Chapter Starting Party');
    container.appendChild(partyCard);
  }

  if (!chapter.paragraphs || chapter.paragraphs.length === 0) {
    if (!chapter.party || chapter.party.length === 0) {
      container.innerHTML += `
        <div class="empty-state">
          <h3>No walkthrough content yet</h3>
          <p>Select another chapter or update your data.js file.</p>
        </div>
      `;
    }
    return;
  }

  // 3. Walkthrough Stream (Paragraphs)
  chapter.paragraphs.forEach(p => {
    let el = document.createElement('div');

    if (p.type === 'plain') {
      el.className = 'paragraph-block';
      const formattedText = p.text.replace(/\[_(.*?)_\]/g, '<mark class="item-tag">$1</mark>');
      el.innerHTML = formattedText;
    } 
    else if (p.type === 'choices') {
      el.className = 'choices-card';
      el.innerHTML = `
        <div class="choices-title">Dialogue</div>
        ${p.items.map(choice => `<div class="choice-item">▸ "${choice}"</div>`).join('')}
      `;
    } 
    else if (p.type === 'note') {
      el.className = 'note-card';
      el.innerHTML = `
        <div class="note-title">💡</div>
        <div>${p.text}</div>
      `;
    } 
    else if (p.type === 'boss') {
      el.className = 'boss-card';
      const bossName = p.name || p.title || p.text || 'BOSS BATTLE';
      const hp = p.hp ? `<span class="boss-stat-badge">HP: ${p.hp}</span>` : '';
      const strategyText = p.strategy || p.text || p.notes || '';
      const formattedStrategy = strategyText ? strategyText.replace(/\[_(.*?)_\]/g, '<mark class="item-tag">$1</mark>') : '';

      let extraFields = '';
      if (p.weakness) {
        extraFields += `<div class="boss-field"><strong>Weakness:</strong> ${p.weakness}</div>`;
      }

      // Rewards
      const rewards = p.reward || p.rewards;
      if (rewards) {
        const rewardText = Array.isArray(rewards) ? rewards.join(', ') : rewards;
        extraFields += `<div class="boss-field"><strong>🏆 </strong> ${rewardText}</div>`;
      }

      // Item Drops
      const drops = p.drops || p.drop || p.items;
      if (drops) {
        const dropsList = Array.isArray(drops) ? drops.join(', ') : drops;
        extraFields += `<div class="boss-field"><strong>🎁 </strong> ${dropsList}</div>`;
      }

      el.innerHTML = `
        <div class="boss-header">
          <span class="boss-title">⚔️ ${bossName}</span>
          ${hp}
        </div>
        ${extraFields}
        ${renderBossCard(bossName)}
        ${formattedStrategy ? `<div class="boss-strategy">${formattedStrategy}</div>` : ''}
        
      `;
      
    }
    else if (p.type === 'party') {
      const title = p.title || p.text || 'Recommended Party Setup';
      const members = p.members || p.party || p.items || [];
      el = createPartyCard(members, title);
    }
    else if (p.type === 'place') {
      el.className = 'place-card';
      const badgesHTML = renderBadges(p);
      const placeRecruitsHTML = renderRecruitsSection(p);

      // Embedded Party inside a "place" block
      let placePartyHTML = '';
      if (p.party && Array.isArray(p.party) && p.party.length > 0) {
        const partyChips = p.party.map(m => renderPartyChip(m)).join('');

        placePartyHTML = `
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
            <div class="party-header" style="font-size: 0.8rem; margin-bottom: 8px;">⚔️ Active / Recommended Party</div>
            <div class="party-grid">${partyChips}</div>
          </div>
        `;
      }

      el.innerHTML = `
        <div class="place-header">📍 ${p.text}</div>
        ${badgesHTML}
        ${placeRecruitsHTML}
        ${placePartyHTML}
        
      `;
    }

    container.appendChild(el);
  });
  container.innerHTML += `<!-- Bottom Navigation Footer (Prev / Next Chapter) -->
    <footer class="chapter-nav-footer">
      ${prevChapter ? `
        <button class="chapter-nav-btn prev-btn" data-chapter-id="${prevChapter.id}">
          <span class="nav-arrow">←</span>
          <div class="nav-btn-text">
            <small>Previous</small>
            <span>${typeof getChapterLabel === 'function' ? getChapterLabel(prevChapter) : `Chapter ${prevChapter.id}`}</span>
          </div>
        </button>
      ` : '<div></div>'}

      ${nextChapter ? `
        <button class="chapter-nav-btn next-btn" data-chapter-id="${nextChapter.id}">
          <div class="nav-btn-text" style="text-align: right;">
            <small>Next</small>
            <span>${typeof getChapterLabel === 'function' ? getChapterLabel(nextChapter) : `Chapter ${nextChapter.id}`}</span>
          </div>
          <span class="nav-arrow">→</span>
        </button>
      ` : '<div></div>'}
    </footer>`;
 // 4. Attach Bottom Nav Button Handlers
  document.querySelectorAll('.chapter-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-chapter-id');
      if (targetId) {
        currentChapterId = targetId;
        if (typeof renderSidebar === 'function') renderSidebar(); // Sync sidebar selection
        renderCurrentChapter();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }); 
}

function renderRecruitsView(container) {
  if (!guideData.recruits || !guideData.recruits.length) {
    container.innerHTML = `<div class="empty-state"><h3>No recruits found</h3></div>`;
    return;
  }

  const totalRecruits = guideData.recruits.length;
  const recruitedCount = userProgress.recruits ? userProgress.recruits.length : 0;

  container.innerHTML = `
    <div class="chapter-header-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 class="chapter-title" style="margin: 0;">108 Stars of Destiny Index</h2>
        <span class="badge" style="background: var(--accent-gold); color: #000; font-weight: bold; font-size: 0.85rem;">
          ${recruitedCount} / ${totalRecruits} Recruited
        </span>
      </div>
      <p style="color: var(--text-muted); margin-top: 6px;">Master list of available character recruits. Click any hero card to toggle recruited status.</p>
    </div>
    <div class="recruits-grid">
      ${guideData.recruits.map(r => renderRecruitCard(r)).join('')}
    </div>
  `;
}

// Render Boss Card Component
function renderBossCard(bossName) {
  // 1. Fetch boss data from guideData.enemies using the boss name
  const bossData = (guideData.enemies[0] && guideData.enemies[0][bossName]) || {};
  const name = bossName || 'Unknown Boss';
  const imgPath = `./img/bosses/${name.toLowerCase()}.gif`;

// 1. Level comes FIRST so it fills column 1 (rows 1-2)
  const statsList = [
    { key: 'level', label: 'LEVEL', val: bossData.Level },
    { key: 'hp', label: 'HP', val: bossData.HP },
    { key: 'power', label: 'POWER', val: bossData.power },
    { key: 'defense', label: 'DEFENSE', val: bossData.defense },
    { key: 'speed', label: 'SPEED', val: bossData.speed },
    { key: 'magic', label: 'MAGIC', val: bossData.magic },
    { key: 'skill', label: 'SKILL', val: bossData.skill },
    { key: 'luck', label: 'LUCK', val: bossData.luck }
  ].filter(s => s.val !== undefined && s.val !== null);

  // 3. Process Weaknesses (Filter out empty string values)
  let weaknesses = [];
  if (Array.isArray(bossData.weaknesses) && bossData.weaknesses.length > 0) {
    const rawWeaknesses = bossData.weaknesses[0];
    Object.entries(rawWeaknesses).forEach(([elem, value]) => {

        weaknesses.push({
          element: elem,
          affinity: value
        });
      
    });
  }

  // 4. Process Drops (Format name and clean double '%%')
  let drops = [];
  if (Array.isArray(bossData.drop)) {
    drops = bossData.drop.map(item => ({
      name: item.name,
      rarity: String(item.Rarity || '').replace(/%%/g, '%')
    }));
  }

  return `
    <div class="boss-body">
        <!-- Boss GIF Sprite -->
        <div class="boss-portrait-container">
          <img 
            src="${imgPath}" 
            alt="${name}" 
            class="boss-sprite" 
            onerror="this.parentElement.style.display='none'"
          />
        </div>

        <!-- Primary Stats Grid -->
        <!-- 5-Column Grid: Level (Col 1, 2 Rows) + 8 Stats (Cols 2-5, 2 Rows) -->
        <div class="boss-stats-grid">
          ${statsList.map(s => `
            <div class="stat-item ${s.key === 'level' ? 'stat-level' : ''}">
              <span class="stat-label">${s.label}</span>
              <span class="stat-value">${s.val}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Elemental Weaknesses / Resistances -->
      ${weaknesses.length > 0 ? `
        <div class="boss-affinities">
          <span class="affinity-title">Affinities:</span>
          <div class="affinity-chips">
            ${weaknesses.map(w => `
              <span class="affinity-chip affinity-${w.affinity.toLowerCase()}">
                ${w.element} <strong>${w.affinity}</strong>
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Item Drops -->
      ${drops.length > 0 ? `
        <div class="boss-drops">
          <span class="drop-title">🎁 </span>
          ${drops.map(d => `
            <span class="drop-chip">
              ${d.name} <small>(${d.rarity})</small>
            </span>
          `).join('')}
        </div>
      ` : ''}
  `;
}

// Render Individual Normal Enemy Card
// Render Normal Enemy Card Component (Matches Boss Card Structure)
// Render Card Component for Enemies & Bosses
function renderEnemyCard(name, enemyData) {
  // 1. Determine if this entry is a Boss
  const isBoss = String(enemyData.type || '').toLowerCase() === 'boss';

  // 2. Dynamic Image Path & Styling based on Type
  const imgFolder = isBoss ? 'bosses' : 'enemies';
  const imgPath = isBoss ? `./img/${imgFolder}/${name.toLowerCase()}.gif` : `./img/${imgFolder}/${enemyData.picture}`;

  const cardClass = isBoss ? 'boss-card' : 'boss-card enemy-card-style';
  const badgeText = isBoss ? '⚔️ BOSS' : '👾 ENEMY';
  const badgeClass = isBoss ? 'boss-badge' : 'boss-badge enemy-badge';
  const levelClass = isBoss ? 'stat-item stat-level' : 'stat-item stat-level enemy-level';

  // 3. Primary Stats (Level first for Column 1 spanning 2 rows)
  const statsList = [
    { key: 'level', label: 'LEVEL', val: enemyData.Level },
    { key: 'hp', label: 'HP', val: enemyData.HP },
    { key: 'power', label: 'POWER', val: enemyData.power },
    { key: 'defense', label: 'DEFENSE', val: enemyData.defense },
    { key: 'speed', label: 'SPEED', val: enemyData.speed },
    { key: 'magic', label: 'MAGIC', val: enemyData.magic },
    { key: 'skill', label: 'SKILL', val: enemyData.skill },
    { key: 'luck', label: 'LUCK', val: enemyData.luck }
  ].filter(s => s.val !== undefined && s.val !== null);

  // 4. Process Weaknesses
  let weaknesses = [];
  if (Array.isArray(enemyData.weaknesses) && enemyData.weaknesses.length > 0) {
    const rawWeaknesses = enemyData.weaknesses[0];
    Object.entries(rawWeaknesses).forEach(([elem, value]) => {
      
        weaknesses.push({ element: elem, affinity: value });
      
    });
  }

  // 5. Process Drops
  let drops = [];
  if (Array.isArray(enemyData.drop)) {
    drops = enemyData.drop.map(item => ({
      name: item.name,
      rarity: String(item.Rarity || '').replace(/%%/g, '%')
    }));
  }

  return `
    <div class="${cardClass}">
      <div class="boss-header">
        <span class="${badgeClass}">${badgeText}</span>
        <h3 class="boss-name">${name}</h3>
      </div>

      <div class="boss-body">
        <!-- GIF Sprite (Folder depends on isBoss) -->
        <div class="boss-portrait-container">
          <img 
            src="${imgPath}" 
            alt="${name}" 
            class="boss-sprite" 
            onerror="this.parentElement.style.display='none'"
          />
        </div>

        <!-- 5-Column Grid -->
        <div class="boss-stats-grid">
          ${statsList.map(s => `
            <div class="${s.key === 'level' ? levelClass : 'stat-item'}">
              <span class="stat-label">${s.label}</span>
              <span class="stat-value">${s.val}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Elemental Affinities -->
      ${weaknesses.length > 0 ? `
        <div class="boss-affinities">
          <span class="affinity-title">Affinities:</span>
          <div class="affinity-chips">
            ${weaknesses.map(w => `
              <span class="affinity-chip affinity-${w.affinity.toLowerCase()}">
                ${w.element} <strong>${w.affinity}</strong>
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}
        
        <div class="boss-drops">
          <span class="drop-title">💰 Bits:</span>
         
            <span class="drop-chip">
              ${enemyData.bits} 
            </span>

        </div>

      <!-- Drops -->
      ${drops.length > 0 ? `
        <div class="boss-drops">
          <span class="drop-title">🎁 Drops:</span>
          ${drops.map(d => `
            <span class="drop-chip">
              ${d.name} <small>(${d.rarity})</small>
            </span>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Render Main Enemies View
function renderEnemiesView() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const allEnemies = guideData.enemies[0] || {};

  // Filter enemies where type is 'normal' (or not explicitly marked as boss)
  const normalEnemies = Object.entries(allEnemies).filter(([_, data]) => {
    const type = String(data.type || '').toLowerCase();
    return type === 'normal' || type === 'boss';
  });

  main.innerHTML = `
    <section class="chapter-header-card">
      <h1 class="chapter-title">👾 Enemy Bestiary</h1>
      <p>Stats, drops, and weaknesses for monsters encountered across the realm (${normalEnemies.length} entries).</p>
    </section>

    <div class="enemies-grid">
      ${normalEnemies.length > 0 
        ? normalEnemies.map(([name, data]) => renderEnemyCard(name, data)).join('')
        : '<p style="padding: 20px; color: var(--text-muted);">No normal enemies found in database.</p>'
      }
    </div>
  `;
}

// Render Active Walkthrough Chapter
function renderCurrentChapter() {
    
  const main = document.getElementById('main-content');
  if (!main) return;

  // 1. Safe chapter lookup (matches string or numeric IDs)
  const chapter = (guideData.chapters || []).find(
    ch => String(ch.id) === String(currentChapterId)
  ) || guideData.chapters?.[0];

  if (!chapter) {
    main.innerHTML = `<p style="padding: 20px; color: #e74c3c;">Chapter ${currentChapterId} not found in guideData!</p>`;
    return;
  }

  main.innerHTML = ``;
 renderChapterView(main, chapter.id);
}