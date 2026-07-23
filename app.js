// State variables
let currentChapterId = 1;
let activeTab = 'chapters';

// Local Storage Keys
const STORAGE_PROGRESS_KEY = 'suiko_progress_data';
const STORAGE_THEME_KEY = 'suiko_theme';

// Load User Progress from localStorage
let userProgress = loadProgress();

function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_PROGRESS_KEY);
    return data ? JSON.parse(data) : { recruits: [], items: [], equipment: [], runes: [], bits: [] };
  } catch (e) {
    return { recruits: [], items: [], equipment: [], runes: [], bits: [] };
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(userProgress));
  } catch (e) {
    console.error('Failed to save progress to localStorage:', e);
  }
}

function toggleProgress(category, key) {
  if (!userProgress[category]) userProgress[category] = [];
  
  // Convert key to string for consistent comparison
  const strKey = String(key);
  const index = userProgress[category].indexOf(strKey);

  if (index > -1) {
    userProgress[category].splice(index, 1);
  } else {
    userProgress[category].push(strKey);
  }

  saveProgress();
  renderContent(); // Re-render view to reflect checked state
}

function isChecked(category, key) {
  if (!userProgress[category]) return false;
  return userProgress[category].includes(String(key));
}

// Theme Switcher Functions
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem(STORAGE_THEME_KEY, newTheme);
  updateThemeButtonUI(newTheme);
}

function updateThemeButtonUI(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
}

// Helper: Formats image path into ./img/stars/ with NO spaces
function getImagePath(name) {
  if (!name) return '';
  const fileName = name.toLowerCase().replace(/\s+/g, '');
  return `./img/stars/${fileName}.png`;
}

// Helper: Resolves a recruit reference (ID, ID object, or full object) to guideData.recruits
function resolveRecruit(ref) {
  if (!guideData || !guideData.recruits) return null;

  let recruitId = null;
  let customOverrides = null;

  if (typeof ref === 'number' || (typeof ref === 'string' && !isNaN(Number(ref)))) {
    recruitId = Number(ref);
  } else if (ref && typeof ref === 'object') {
    if (ref.id !== undefined && ref.id !== null) {
      recruitId = Number(ref.id);
      customOverrides = ref;
    } else {
      return ref; // Object without ID, treat as direct recruit object
    }
  }

  if (recruitId !== null) {
    const found = guideData.recruits.find(r => r.id === recruitId);
    if (found) {
      return customOverrides ? { ...found, ...customOverrides } : found;
    }
  }

  return null;
}

// Helper: Generates HTML for a single Recruit Card (Interactive for recruiting)
function renderRecruitCard(ref) {
  const recruit = resolveRecruit(ref);

  if (!recruit) {
    const fallbackName = typeof ref === 'object' ? (ref.name || 'Unknown Recruit') : String(ref);
    return `
      <div class="recruit-card">
        <div class="recruit-header">
          <div class="recruit-info">
            <div class="recruit-name"><span>${fallbackName}</span></div>
          </div>
        </div>
      </div>
    `;
  }

  const recruitKey = recruit.id !== null && recruit.id !== undefined ? recruit.id : recruit.name;
  const recruited = isChecked('recruits', recruitKey);

  const imgSrc = getImagePath(recruit.name);
  const idPrefix = (recruit.id !== null && recruit.id !== undefined) ? `#${recruit.id} ` : '';

  return `
    <div class="recruit-card ${recruited ? 'recruited' : ''}" 
         data-track-cat="recruits" 
         data-track-key="${recruitKey}"
         title="Click to toggle recruited status">
      <div class="recruit-header">
        <img src="${imgSrc}" alt="${recruit.name}" class="recruit-img" onerror="this.style.display='none'">
        <div class="recruit-info">
          <div class="recruit-name">
            <span>${idPrefix}${recruit.name}</span>
            ${recruit.range ? `<span class="recruit-range">Range: ${recruit.range}</span>` : ''}
          </div>
        </div>
        <span class="recruit-status-badge">${recruited ? '✔ Recruited' : '◯ Not Recruited'}</span>
      </div>
    </div>
  `;
}

// Helper: Builds a recruits section grid for chapters or place blocks
function renderRecruitsSection(dataObj) {
  if (!dataObj || !dataObj.recruits || !Array.isArray(dataObj.recruits) || dataObj.recruits.length === 0) {
    return '';
  }

  const cardsHTML = dataObj.recruits.map(ref => renderRecruitCard(ref)).join('');

  return `
    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
      <div style="font-size: 0.8rem; font-weight: bold; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">⭐ Available Recruit(s)</div>
      <div class="recruits-grid">${cardsHTML}</div>
    </div>
  `;
}

// Helper: Renders inline badges with interactive checkbox progress tracking
function renderBadges(dataObj) {
  if (!dataObj) return '';

  const categories = [
    { key: 'savepoints', label: 'Save Points', trackable: false },
    { key: 'places', label: 'Locations', trackable: false },
    { key: 'enemies', label: 'Enemies', trackable: false },
    { key: 'items', label: 'Items', trackable: true },
    { key: 'equipment', label: 'Equipment', trackable: true },
    { key: 'runes', label: 'Runes', trackable: true },
    { key: 'bits', label: 'Bits', trackable: true }
  ];

  let html = '';
  categories.forEach(cat => {
    const val = dataObj[cat.key];
    if (val && Array.isArray(val) && val.length > 0) {
      const badges = val.map(x => {
        const isObj = typeof x === 'object' && x !== null;
        const label = isObj ? (x.name || x.title || JSON.stringify(x)) : x;
        const typeStr = isObj && typeof x.type === 'string' ? x.type.toLowerCase() : '';
        const isBoss = isObj && (typeStr === 'boss' || x.isBoss === true);

        // Check trackable state
        const checked = cat.trackable ? isChecked(cat.key, label) : false;

        let badgeClass = 'badge';
        if (isBoss) badgeClass += ' badge-boss';
        if (cat.trackable) badgeClass += ' badge-trackable';
        if (checked) badgeClass += ' checked';

        const icon = isBoss ? '💀 ' : (checked ? '✔ ' : '');
        const trackAttrs = cat.trackable ? `data-track-cat="${cat.key}" data-track-key="${label}" title="Click to check off"` : '';

        return `<span class="${badgeClass}" ${trackAttrs}>${icon}${label}</span>`;
      }).join('');

      html += `<div class="badge-group"><span class="badge-label">${cat.label}:</span> ${badges}</div>`;
    }
  });

  return html;
}

// Helper: Generates HTML for a single party member chip with an avatar
function renderPartyChip(m) {
  const name = typeof m === 'object' ? (m.name || m.character) : m;
  const level = typeof m === 'object' && m.level ? `Lv. ${m.level}` : '';
  const imgSrc = getImagePath(name);

  return `
    <div class="party-member-chip">
      <img src="${imgSrc}" alt="${name}" class="member-img" onerror="this.style.display='none'">
      <div class="member-details">
        <span class="member-name">${name}</span>
        ${level ? `<span class="member-level">${level}</span>` : ''}
      </div>
    </div>
  `;
}

// Helper: Builds full party card elements
function createPartyCard(members, title = 'Current Party') {
  const el = document.createElement('div');
  el.className = 'party-card';
  
  const membersHTML = members.map(m => renderPartyChip(m)).join('');

  el.innerHTML = `
    <div class="party-header">⚔️ ${title}</div>
    <div class="party-grid">${membersHTML}</div>
  `;
  return el;
}

// Initialize the app
function initApp() {
  initTheme();

  if (typeof guideData === 'undefined' || !guideData) {
    document.getElementById('main-container').innerHTML = `
      <div class="empty-state">
        <h3>Unable to load guide data</h3>
        <p>Make sure <code>data.js</code> is correctly loaded in <code>index.html</code> before <code>app.js</code>.</p>
      </div>
    `;
    return;
  }

  setupEventListeners();
  renderSidebarControls();
  renderSidebar();
  renderContent();
}

function setupEventListeners() {
  document.getElementById('tab-chapters').addEventListener('click', () => switchTab('chapters'));
  document.getElementById('tab-recruits').addEventListener('click', () => switchTab('recruits'));

  // Global Event Delegation for interactive progress tracking clicks (Items, Recruits, etc.)
  document.getElementById('main-container').addEventListener('click', (e) => {
    const trackable = e.target.closest('[data-track-cat]');
    if (trackable) {
      e.stopPropagation();
      const cat = trackable.getAttribute('data-track-cat');
      const key = trackable.getAttribute('data-track-key');
      toggleProgress(cat, key);
    }
  });
}

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

function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-chapters').classList.toggle('active', tab === 'chapters');
  document.getElementById('tab-recruits').classList.toggle('active', tab === 'recruits');
  renderSidebar();
  renderContent();
}

function selectChapter(id) {
  currentChapterId = id;
  if (activeTab !== 'chapters') switchTab('chapters');
  renderSidebar();
  renderContent();
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
        extraFields += `<div class="boss-field"><strong>🏆 Reward:</strong> ${rewardText}</div>`;
      }

      // Item Drops
      const drops = p.drops || p.drop || p.items;
      if (drops) {
        const dropsList = Array.isArray(drops) ? drops.join(', ') : drops;
        extraFields += `<div class="boss-field"><strong>🎁 Drops:</strong> ${dropsList}</div>`;
      }

      el.innerHTML = `
        <div class="boss-header">
          <span class="boss-title">⚔️ BOSS BATTLE: ${bossName}</span>
          ${hp}
        </div>
        ${extraFields}
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

// Start app when DOM loads
window.addEventListener('DOMContentLoaded', initApp);