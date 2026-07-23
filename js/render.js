function renderSidebarControls() {
  const sidebar = document.querySelector('.sidebar') || document.getElementById('sidebar');
  if (!sidebar) return;

  // Ensure top header controls with Theme Switcher button exist
  let controlsContainer = document.getElementById('sidebar-controls');
  if (!controlsContainer) {
    controlsContainer = document.createElement('div');
    controlsContainer.id = 'sidebar-controls';
    controlsContainer.className = 'sidebar-controls';
    sidebar.insertBefore(controlsContainer, sidebar.firstChild);
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  controlsContainer.innerHTML = `
    <button id="theme-toggle-btn" class="theme-btn" onclick="toggleTheme()">
      ${currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  `;
}

function renderSidebar() {
  const container = document.getElementById('chapter-list-container');
  if (!container) return;

  container.innerHTML = '';

  if (!guideData || !guideData.chapters) return;

  guideData.chapters.forEach(ch => {
    const li = document.createElement('li');
    li.className = `chapter-item ${ch.id === currentChapterId && activeTab === 'chapters' ? 'active' : ''}`;
    li.onclick = () => selectChapter(ch.id);
    li.innerHTML = `
      <span class="chapter-num">#${ch.id}</span>
      <span>${ch.title}</span>
    `;
    container.appendChild(li);
  });
}

function renderContent() {
  const container = document.getElementById('main-container');
  container.innerHTML = '';

  if (activeTab === 'recruits') {
    renderRecruitsView(container);
  } else {
    renderChapterView(container, currentChapterId);
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
        <div class="choices-title">Dialogue / Choice Branch</div>
        ${p.items.map(choice => `<div class="choice-item">▸ "${choice}"</div>`).join('')}
      `;
    } 
    else if (p.type === 'note') {
      el.className = 'note-card';
      el.innerHTML = `
        <div class="note-title">💡 Strategy Note</div>
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
    { key: 'potch', label: 'POTCH', val: bossData.bits ? `${bossData.bits}` : null },
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
      if (value && value.trim() !== '') {
        weaknesses.push({
          element: elem,
          affinity: value
        });
      }
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
                ${w.element}: <strong>${w.affinity}</strong>
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