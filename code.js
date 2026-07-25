// State variables


// Local Storage Keys
const STORAGE_PROGRESS_KEY = 'suiko_progress_data';
const STORAGE_THEME_KEY = 'suiko_theme';
const STORAGE_CHAPTER_KEY = 'suiko_chapter';

// Load User Progress from localStorage
let userProgress = loadProgress();
let currentChapterId = loadSavedChapter() || 1;

var activeTab = 'walkthrough';

function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_PROGRESS_KEY);
    return data ? JSON.parse(data) : { recruits: [], items: [], equipment: [], runes: [], bits: [] };
  } catch (e) {
    return { recruits: [], items: [], equipment: [], runes: [], bits: [] };
  }
}

function loadSavedChapter() {
  try {
    const data = localStorage.getItem(STORAGE_CHAPTER_KEY);
    return parseInt(data) ;
  } catch (e) {
    return 1;
  }
}


function saveProgress() {
  try {
    localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(userProgress));
  } catch (e) {
    console.error('Failed to save progress to localStorage:', e);
  }
}

function saveCurrentChapter() {
  try {
    localStorage.setItem(STORAGE_CHAPTER_KEY, currentChapterId);
  } catch (e) {
    console.error('Failed to save chapter to localStorage:', e);
  }
}

function toggleProgress(category, key) {
  if (!userProgress[category]) userProgress[category] = [];
  
  // Convert key to string for consistent comparison
  const strKey = parseInt(key);

  const index = userProgress[category].indexOf(strKey);

  if (index > -1) {
    userProgress[category].splice(index, 1);
  } else {
    userProgress[category].push(strKey);
  }

  saveProgress();
  renderCurrentChapter(); // Re-render view to reflect checked state
}

function isChecked(category, key) {
  if (!userProgress[category]) return false;
  return userProgress[category].includes(key);
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



// Initialize the app
function initApp() {
  initTheme();

  if (typeof guideData === 'undefined' || !guideData) {
    document.getElementById('main-content').innerHTML = `
      <div class="empty-state">
        <h3>Unable to load guide data</h3>
        <p>Make sure <code>data.js</code> is correctly loaded in <code>index.html</code> before <code>app.js</code>.</p>
      </div>
    `;
    return;
  }

  renderSidebar();
  setupEventListeners();
  renderSidebarControls();
  renderCurrentChapter();
}

function setupEventListeners() {
  /*
  document.getElementById('tab-walkthrough').addEventListener('click', () => switchTab('walkthrough'));
  document.getElementById('tab-recruits').addEventListener('click', () => switchTab('recruits'));
  document.getElementById('tab-enemies').addEventListener('click', () => switchTab('enemies'));
*/
  // Global Event Delegation for interactive progress tracking clicks (Items, Recruits, etc.)
  document.getElementById('main-content').addEventListener('click', (e) => {
    const trackable = e.target.closest('[data-track-cat]');
    if (trackable) {
      e.stopPropagation();
      const cat = trackable.getAttribute('data-track-cat');
      const key = trackable.getAttribute('data-track-key');
      toggleProgress(cat, key);
    }
  });

  // Initialize floating tooltip div
  if (typeof initEnemyTooltip === 'function') {
    initEnemyTooltip();
  }

  // GLOBAL HOVER DELEGATION FOR ENEMIES/BOSSES
  document.addEventListener('mouseover', (e) => {
    // Looks for elements with class .enemy-chip or attribute data-enemy-name
    const target = e.target.closest('.enemy-chip, [data-enemy-name]');
    if (!target) return;

    const enemyName = target.getAttribute('data-enemy-name') || target.textContent;
    showEnemyTooltip(enemyName, e);
  });

  document.addEventListener('mousemove', (e) => {
    positionEnemyTooltip(e);
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('.enemy-chip, [data-enemy-name]');
    if (target) {
      hideEnemyTooltip();
    }
  });

  const sidebar = document.getElementById('sidebar-nav') || document.getElementById('sidebar');

  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      // A. Toggle Accordion Header (Open / Collapse Walkthrough)
      const toggleBtn = e.target.closest('.accordion-toggle');
      if (toggleBtn) {
        const group = toggleBtn.closest('.accordion-group');
        group.classList.toggle('expanded');
        return;
      }

      // B. Click Chapter Link
      const chapterLink = e.target.closest('.nav-item[data-chapter-id]');
      if (chapterLink) {
        e.preventDefault();
        const rawId = chapterLink.getAttribute('data-chapter-id');
        currentChapterId = parseInt(rawId);
        saveCurrentChapter();
        // Highlight active chapter
        sidebar.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
        chapterLink.classList.add('active');


        /*
        // Render selected chapter & scroll up
        if (typeof switchView === 'function') {
          switchView('walkthrough');
        } else {
          renderCurrentChapter();
        }
          */
         switchView('walkthrough');
         renderCurrentChapter();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // C. Click Main View Buttons (Enemies / Recruits)
      const viewBtn = e.target.closest('.nav-btn-main[data-view]');
      if (viewBtn) {
        const viewName = viewBtn.getAttribute('data-view');
        if (typeof switchView === 'function') {
          switchView(viewName);
        }
      }
/* Cities */
      const cityLink = e.target.closest('.nav-item[data-city-id]');
      if (cityLink) {
        e.preventDefault();
        const rawId = cityLink.getAttribute('data-city-id');
        
        const container = document.getElementById('main-content');
        container.innerHTML = renderCity(rawId, guideData.cities[rawId]);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    });
  }
}



function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-walkthrough').classList.toggle('active', tab === 'walkthrough');
  document.getElementById('tab-recruits').classList.toggle('active', tab === 'recruits');
  document.getElementById('tab-enemies').classList.toggle('active', tab === 'enemies');
  renderSidebar();
  renderContent();
}

function selectChapter(id) {
  currentChapterId = id;
  if (activeTab !== 'walkthrough') switchTab('walkthrough');
  renderSidebar();
  renderContent();
}


// Global View Switcher
function switchView(viewName) {
  const sidebar = document.getElementById('sidebar-nav') || document.getElementById('sidebar');

  // 1. Update Active Highlight on Sidebar Main Buttons
  if (sidebar) {
    // Remove active state from all main view buttons
    sidebar.querySelectorAll('.nav-btn-main').forEach(btn => btn.classList.remove('active'));

    if (viewName !== 'walkthrough') {
      // De-highlight active chapter link when switching away from walkthrough
      sidebar.querySelectorAll('.nav-item').forEach(link => link.classList.remove('active'));

      // Highlight target main view button
      const targetBtn = sidebar.querySelector(`.nav-btn-main[data-view="${viewName}"]`);
      if (targetBtn) targetBtn.classList.add('active');
    }
  }

  // 2. Scroll to top of page cleanly
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 3. Render Content Based on View Name

activeTab = viewName;
  switch (viewName) {
    case 'walkthrough':
      if (typeof renderCurrentChapter === 'function') {

        renderCurrentChapter();
      }
      break;

    case 'enemies':
      if (typeof renderEnemiesView === 'function') {
        renderEnemiesView();
      }
      break;

    case 'recruits':
      if (typeof renderRecruitsView === 'function') {
        let container = document.getElementById('main-content');
        renderRecruitsView(container);
      }
      break;
    case 'hq':
      if (typeof renderHQView === 'function') {
        renderHQView();
      }
      break;  
          case 'collectibles':
      if (typeof renderAllCollectiblesView === 'function') {
        renderAllCollectiblesView();
      }
      break;  
      case 'unites':
          if (typeof renderUnitesView === 'function') {
            renderUnitesView();
          }
      break;  


    default:
      console.warn(`Unknown view: ${viewName}. Defaulting to walkthrough.`);
      if (typeof renderCurrentChapter === 'function') {
        renderCurrentChapter();
      }
      break;
  }
}

// Get saved collected item IDs from localStorage
function getCheckedCollectibles() {
  return JSON.parse(localStorage.getItem('suiko1_collectibles') || '[]');
}

// Toggle saved state in localStorage
function toggleChapterCollectible(itemId, chapterIdsJson) {
  let saved = getCheckedCollectibles();
  if (saved.includes(itemId)) {
    saved = saved.filter(id => id !== itemId);
  } else {
    saved.push(itemId);
  }
  localStorage.setItem('suiko1_collectibles', JSON.stringify(saved));

  // Toggle visual completed state on the row
  const domId = sanitizeId(itemId);
  const row = document.getElementById(`chapter-item-${domId}`);
  if (row) row.classList.toggle('completed');

  // Update chapter header counter
  const chapterIds = JSON.parse(chapterIdsJson);
  const countSpan = document.getElementById('chapter-coll-count');
  if (countSpan) {
    const foundCount = chapterIds.filter(cId => saved.includes(cId)).length;
    countSpan.innerText = `${foundCount} / ${chapterIds.length} Found`;
  }
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  
  // Attach to document.body to survive any innerHTML re-renders
  document.body.addEventListener('click', (e) => {
    const trackable = e.target.closest('[data-track-cat]');
    
    if (trackable) {
      // PREVENT DOUBLE-FIRE: If they clicked a label, let the browser 
      // trigger the checkbox's click event instead of handling it twice.
      if (e.target.tagName.toLowerCase() === 'label') {
        return; 
      }

      // Read your data attributes
      const cat = trackable.getAttribute('data-track-cat');
      const key = trackable.getAttribute('data-track-key');
      
      // Execute your logic
      if (typeof toggleProgress === 'function') {
         toggleProgress(cat, key);
      }
    }
  });

});

// Start app when DOM loads
window.addEventListener('DOMContentLoaded', initApp);

 const guideData = { collectibles: [], chapters: [] };

// Files to load in order
const dataFiles = [
  './data/collectibles.js',
  './data/enemies.js',
  './data/recruits.js',
  './data/major.js',
  './data/duel.js',
  './data/hq.js',
  './data/unites.js',
  './data/cities.js',
  './data/chapters/ch01.js',
  './data/chapters/ch02.js',
  './data/chapters/ch03.js',
  './data/chapters/ch04.js',
  './data/chapters/ch05.js',
  './data/chapters/ch06.js',
  './data/chapters/ch07.js',
  './data/chapters/ch08.js',
  './data/chapters/ch09.js',
  './data/chapters/ch10.js',
  './data/chapters/ch11.js',
  './data/chapters/ch12.js',
  './data/chapters/ch13.js',
  './data/chapters/ch14.js',
  './data/chapters/ch15.js',
  './data/chapters/ch16.js',
  './data/chapters/ch17.js',
  './data/chapters/ch18.js',
  './data/chapters/ch19.js',
  './data/chapters/ch20.js',
  './data/chapters/ch21.js',
  './data/chapters/ch22.js',
  './data/chapters/ch23.js',
  './data/chapters/ch24.js',
  './data/chapters/ch25.js',
  './data/chapters/ch26.js',
  './data/chapters/ch27.js',
  './data/chapters/ch28.js',
  './data/chapters/ch29.js',
  './data/chapters/ch30.js',
  './data/chapters/ch31.js',
  './data/chapters/ch32.js',
  './js/helpers.js',
  './js/render.js',
  './js/app.js' // Loads app logic last
];

// Load scripts sequentially
function loadScripts(files) {
  return files.reduce((promise, src) => {
    return promise.then(() => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    }));
  }, Promise.resolve());
}

// Start loading
loadScripts(dataFiles)
  .then(() => {
    console.log('All data loaded successfully!');
    if (typeof initApp === 'function') initApp();
  })
  .catch(err => console.error(err));

  // Helper to render distinct range badges
function renderRangeBadge(range) {
  if (!range) return '';

  const r = String(range).trim().toUpperCase();

  if (r === 'NP') {
    return `<span class="range-badge range-np" title="Non-Playable / Support Staff">NP</span>`;
  }

  // Standard combat ranges (S, M, L)
  return `<span class="range-badge range-${r.toLowerCase()}">${r}</span>`;
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
        <div class="recruit-condition">${recruit.condition}</div>
      </div>
    `;
  }

  const recruitKey = recruit.id !== null && recruit.id !== undefined ? recruit.id : recruit.name;
  const recruited = isChecked('recruits', recruitKey);

  const imgSrc = getImagePath(recruit.name);
  const idPrefix = (recruit.id !== null && recruit.id !== undefined) ? `#${recruit.id} ` : '';

  return `
    <div class="recruit-card ${recruited ? 'recruited' : ''} ${recruit.range === 'NP' ? 'recruit-support' : ''}" 
         data-track-cat="recruits" 
         data-track-key="${recruitKey}"
         title="Click to toggle recruited status">
      <div class="recruit-header">
        <img src="${imgSrc}" alt="${recruit.name}" class="recruit-img" onerror="this.style.display='none'">
        <div class="recruit-info">
          <div class="recruit-name">
            <span>${idPrefix}${recruit.name}</span>
           ${renderRangeBadge(recruit.range)}
          </div>
        </div>
        <span class="recruit-status-badge">${recruited ? '✔ Recruited' : '◯ Not Recruited'}</span>
      </div>
      <div class="recruit-condition">${recruit.condition ? recruit.condition : ''}</div>
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
        if(cat.key === 'enemies') badgeClass += ' enemy-chip ';

        const icon = isBoss ? '💀 ' : (checked ? '✔ ' : '');
        const trackAttrs = cat.trackable ? `data-track-cat="${cat.key}" data-track-key="${label}" title="Click to check off"` : '';

        return `<span data-enemy-name="${cat.key === 'enemies' ? label : ''}" class="${badgeClass}" ${trackAttrs}>${icon}${label}</span>`;
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

// Generates image path from boss name (e.g. "Zombie Dragon" -> "./img/bosses/zombie dragon.gif" or "zombie_dragon.gif")
function getBossImagePath(bossName) {
  if (!bossName) return '';
  const cleanName = String(bossName).trim().toLowerCase();
  return `./img/bosses/${cleanName}.gif`;
}

// Formats object keys into user-friendly labels (e.g., "item_drop" -> "Item Drop", "hp" -> "HP")
function formatStatLabel(key) {
  const customLabels = {
    hp: 'HP',
    exp: 'EXP',
    mp: 'MP',
    potch: 'Potch',
    bits: 'Potch'
  };

  if (customLabels[key.toLowerCase()]) {
    return customLabels[key.toLowerCase()];
  }

  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// 1. Ensure floating element exists in DOM
function initEnemyTooltip() {
  if (!document.getElementById('enemy-tooltip')) {
    const tooltip = document.createElement('div');
    tooltip.id = 'enemy-tooltip';
    document.body.appendChild(tooltip);
  }
}

// 2. Show Tooltip
function showEnemyTooltip(enemyName, mouseEvent) {
  const tooltip = document.getElementById('enemy-tooltip');
  if (!tooltip || !guideData.enemies) return;

  // Clean name lookup (removes leading emojis or icons)
  const cleanName = enemyName.replace(/^[\s★⚔️👾]+/g, '').trim();
  const enemyData = guideData.enemies[0][cleanName];

  if (!enemyData) return; // If enemy isn't in database, do nothing

  // Render using your existing card generator!
  tooltip.innerHTML = renderEnemyCard(cleanName, enemyData);
  tooltip.classList.add('visible');

  positionEnemyTooltip(mouseEvent);
}

// 3. Move Tooltip with Cursor + Viewport Safety
function positionEnemyTooltip(e) {
  const tooltip = document.getElementById('enemy-tooltip');
  if (!tooltip || !tooltip.classList.contains('visible')) return;

  const offset = 16; // Margin from cursor
  let left = e.clientX + offset;
  let top = e.clientY + offset;

  const rect = tooltip.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Flip horizontally if overflow right
  if (left + rect.width > windowWidth - 10) {
    left = e.clientX - rect.width - offset;
  }

  // Flip vertically if overflow bottom
  if (top + rect.height > windowHeight - 10) {
    top = e.clientY - rect.height - offset;
  }

  tooltip.style.left = `${Math.max(10, left)}px`;
  tooltip.style.top = `${Math.max(10, top)}px`;
}

// 4. Hide Tooltip
function hideEnemyTooltip() {
  const tooltip = document.getElementById('enemy-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
  }
}

/**
 * Formats a clean chapter label from a chapter object or ID.
 * @param {Object|string|number} chapter - The chapter object or identifier
 * @returns {string} Formatted label (e.g., "Chapter 1", "Prologue", etc.)
 */
function getChapterLabel(chapter) {
  if (!chapter) return 'Chapter';

  return `${chapter.id} - ${chapter.title}`
  return 'Chapter';
}
// Helper to search recruit data across guideData structures
function findRecruitData(key) {
  if (!key) return null;
  const rawKey = String(key).trim();
  const recruits = guideData.recruits || guideData.stars || [];

  if (Array.isArray(recruits)) {
    return recruits.find(r => 
      String(r.id) === rawKey || 
      String(r.star) === rawKey || 
      String(r.number) === rawKey ||
      (r.name && r.name.toLowerCase() === rawKey.toLowerCase())
    ) || null;
  } else if (typeof recruits === 'object' && recruits !== null) {
    if (recruits[rawKey]) return recruits[rawKey];
    return Object.values(recruits).find(r => 
      r.name && String(r.name).toLowerCase() === rawKey.toLowerCase()
    ) || null;
  }
  return null;
}

// Helper to resolve recruit display info
  const getRecruitInfo = (unlockedBy) => {
    if (!unlockedBy && unlockedBy !== 0) return null;

    const rawKey = String(unlockedBy).trim();
    const found = findRecruitData(rawKey);
    const recruitName = found ? (found.name || found.character || rawKey) : rawKey;
    const picFileName = (found && found.picture) ? found.picture : `${recruitName}.png`;

    return {
      rawKey: rawKey,
      name: recruitName,
      picture: `./img/stars/${picFileName.toLowerCase()}`,
      isStar: !!found
    };
  };

  // Helper to safely format HTML element IDs from titles with spaces
function sanitizeId(str) {
  return String(str).replace(/[^a-zA-Z0-9_-]/g, '_');
}

function enhanceParagraphText(text) {
  const recruits = guideData?.recruits || [];
  if (!recruits.length || !text) return text;

  // 1. Sort recruits by name length (descending) 
  // Ensures longer names like "Tir McDohl" match before shorter names like "Tir"
  const sortedRecruits = [...recruits].sort((a, b) => b.name.length - a.name.length);

  // 2. Escape special regex characters in names
  const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 3. Create a pattern matching any recruit name with word boundaries (\b)
  const namesPattern = sortedRecruits.map(r => escapeRegExp(r.name)).join('|');
  const regex = new RegExp(`\\b(${namesPattern})\\b`, 'gi');

  // 4. Replace matches with inline tooltip HTML
  return text.replace(regex, (matchedName) => {
    // Find the matching recruit object (case-insensitive)
    const recruit = sortedRecruits.find(r => r.name.toLowerCase() === matchedName.toLowerCase());
    if (!recruit) return matchedName;

    return `
      <span class="inline-recruit-mention">
        <span class="recruit-mention-text">${matchedName}</span>
        <span class="recruit-inline-tooltip">
          <span class="tooltip-header">
            <img 
              src= "./img/stars/${recruit.name.toLowerCase()}.png" 
              alt="${recruit.name}" 
              onerror="this.src='img/placeholder.png'" 
            />
            <strong>${recruit.name}</strong>
          </span>
          <ul>
            ${recruit.star ? `<li>🌟 <span>${recruit.star}</span></li>` : ''}
            ${recruit.range ? `<li>🎯 <span>${recruit.range}</span></li>` : ''}
            ${recruit.condition ? `<li>📍 <span>${recruit.condition}</span></li>` : ''}
          </ul>
        </span>
      </span>
    `.replace(/\s+/g, ' ').trim();
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
  const cities = guideData.cities || [];

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

      <button class="nav-btn-main" data-view="hq">
        <span>🏰 Headquarters</span>
      </button>

      <button class="nav-btn-main" data-view="collectibles">
        <span>💎 Collectibles</span>
      </button>

      <button class="nav-btn-main" data-view="unites">
        <span>🤜🤛 Unites</span>
      </button>
<!--cities -->
      <div class="accordion-group" id="group-cities">
        <button class="accordion-toggle" id="toggle-cities">
          <span>🛖 Cities</span>
          <span class="accordion-arrow">▼</span>
        </button>
        
        <div class="accordion-menu" id="city-sub-menu">
          ${cities.map((c, index ) => {

            return `
              <a href="#" class="nav-item" data-city-id="${index}">
                ${c.name}
              </a>
            `;
          }).join('')}
        </div>
      </div>
    </nav>
  `;
}

function renderContent() {
  const container = document.getElementById('main-content');



}

function renderChapterView(container, chapterId) {
  const chapter = guideData.chapters.find(c => c.id === chapterId);
  if (!chapter) return;

  // 1. Chapter Header Card with metadata badges & recruits grid
  const header = document.createElement('div');
  header.className = 'chapter-header-card';
  const chapterBadgesHTML = renderBadges(chapter);
  const chapterRecruitsHTML = renderRecruitsSection(chapter);

// 1. Get picture filename and build background style with legibility overlay
const bgImageName = chapter.pictures || chapter.picture || chapter.image;

  if(bgImageName) {
    header.style.backgroundImage = "linear-gradient(rgba(15, 15, 22, 0.2), rgba(15, 15, 22, 1)), url('./img/chapters/" + bgImageName + "')";
    header.style.backgroundSize = "cover";
    header.style.backgroundPosition = "center";
  }


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

  //Key items / collectibles
      if (chapter.collectibles && Array.isArray(chapter.collectibles) && chapter.collectibles.length > 0) {
    const keyCard = renderChapterCollectibles(chapter.collectibles);
    container.innerHTML += keyCard;
  }

  if (!chapter.paragraphs || chapter.paragraphs.length === 0) {
    //if (!chapter.party || chapter.party.length === 0) {
      container.innerHTML += `
        <div class="empty-state">
          <h3>No walkthrough content yet</h3>
          <p>Select another chapter or update your data.js file.</p>
        </div>
      `;
    //}
    return;
  }

  // 3. Walkthrough Stream (Paragraphs)
  chapter.paragraphs.forEach(p => {
    let el = document.createElement('div');

    if (p.type === 'plain') {
      el.className = 'paragraph-block';
      // Generate image element if p.picture is defined
        const imageMarkup = p.picture ? `
          <figure class="inline-paragraph-img">
            <img 
              src="img/chapters/${p.picture}" 
              alt="Walkthrough screenshot" 
              loading="lazy"
              onerror="this.parentNode.style.display='none'"
            />
          </figure>
        ` : '';
      const formattedText = enhanceParagraphText(p.text.replace(/\[_(.*?)_\]/g, '<mark class="item-tag">$1</mark>'));
      el.innerHTML = imageMarkup + formattedText;
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
    else if (p.type === 'mb'){
      el.innerHTML = renderMajorBattleCard(p.id);
    }

    else if (p.type === 'duel'){
      el.innerHTML = renderDuelCard(p.id);
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
      const targetId = parseInt(btn.getAttribute('data-chapter-id'));
      
      if (targetId) {
        currentChapterId = targetId;
        saveCurrentChapter();
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
  container.scrollTop = 0;
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
  main.scrolltop = 0;
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
  activeTab = activeTab ? activeTab : 'walkthrough';

 switch (activeTab) {
    case 'walkthrough':
      if (typeof renderChapterView === 'function') {

        renderChapterView(main, currentChapterId)
      }
      break;

    case 'enemies':
      if (typeof renderEnemiesView === 'function') {
        renderEnemiesView();
      }
      break;

    case 'recruits':
      if (typeof renderRecruitsView === 'function') {
        let container = document.getElementById('main-content');
        renderRecruitsView(container);
      }
      break;
    case 'hq':
      if (typeof renderHQView === 'function') {
        renderHQView();
      }
      break;  
          case 'collectibles':
      if (typeof renderAllCollectiblesView === 'function') {
        renderAllCollectiblesView();
      }
      break;  
      case 'unites':
          if (typeof renderUnitesView === 'function') {
            renderUnitesView();
          }
      break;  


    default:
      console.warn(`Unknown view: ${activeTab}. Defaulting to walkthrough.`);
      if (typeof renderChapterView === 'function') {
        renderChapterView(main,1);
      }
      break;
  }
main.scrollTop = 0;
}

// Render Major Battle Card
function renderMajorBattleCard(mbId) {
  if (!mbId && mbId !== 0) return '';

  const majorList = guideData.major || [];
  const battle = majorList.find(b => String(b.id) === String(mbId));

  if (!battle) return '';

  const title = battle.title || 'Major Battle';
  const countUs = battle.countUs !== undefined ? battle.countUs.toLocaleString() : '???';
  const countThem = battle.countThem !== undefined ? battle.countThem.toLocaleString() : '???';
  const strategyItems = Array.isArray(battle.strategy) 
    ? battle.strategy 
    : [battle.strategy].filter(Boolean);

  const ontroItems = Array.isArray(battle.ontro) 
    ? battle.ontro 
    : [battle.ontro].filter(Boolean);

  let img = battle.picture ? `./img/major/` + battle.picture :``;
  let bgStyle = ``;
  if(img) {
    bgStyle = `background-image: linear-gradient(rgba(15, 15, 22, 0.2), rgb(15, 15, 22)), url('`+ img + `'); background-size: cover; background-position: center center;`;
  }

// Process Intro Pre-Battle Dialogue
  let introLines = [];
  if (Array.isArray(battle.intro)) {
    battle.intro.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([speaker, line]) => {
          if (line && String(line).trim()) {
            introLines.push({ speaker, line: String(line).trim() });
          }
        });
      }
    });
  }

// Process Intro Pre-Battle Dialogue
  let outroLines = [];
  if (Array.isArray(battle.outro)) {
    battle.outro.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([speaker, line]) => {
          if (line && String(line).trim()) {
            outroLines.push({ speaker, line: String(line).trim() });
          }
        });
      }
    });
  }

  return `
    <div class="major-battle-card" style="${bgStyle}">
      <div class="mb-header">
        <span class="mb-badge">⚔️ MAJOR BATTLE</span>
        <h3 class="mb-title">${title}</h3>
      </div>

      <!-- Force Count Comparison -->
      <div class="mb-forces">
        <div class="force-item force-them">
          <span class="force-label">Imperial Army</span>
          <span class="force-count">⚔️ ${countThem}</span>
        </div>
        <div class="force-vs">VS</div>
        <div class="force-item force-us">
          <span class="force-label">Liberation Army</span>
          <span class="force-count">🛡️ ${countUs}</span>
        </div>
      </div>

   <!-- Pre-Battle Dialogue Intro -->
      ${introLines.length > 0 ? `
        <div class="mb-intro-box">
          <h4 class="mb-intro-title">💬 Intro</h4>
          <div class="mb-dialogue-list">
            ${introLines.map(d => `
              <div class="mb-dialogue-line">
                <strong class="mb-speaker">${d.speaker}:</strong>
                <span class="mb-quote">"${d.line}"</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="mb-strategy-box">
        <div class="mb-strategy-paragraphs">
            <p><strong>Charge vs. Bow</strong> : Both sides take losses, Bow more so.</p>
            <p><strong>Bow vs. Magic</strong> : Magic suffers losses, loses its turn.</p>
            <p><strong>Magic vs. Charge</strong> : Charge suffers heavy losses, loses its turn.</p>
            <p><strong>Same vs. Same</strong> : Both sides suffer losses.</p>
        </div>
      </div>
      <br />
      <!-- Tactical Strategy Paragraphs -->
      ${strategyItems.length > 0 ? `
        <div class="mb-strategy-box">
          <h4 class="mb-strategy-title">📜 Battle Strategy</h4>
          <div class="mb-strategy-paragraphs">
            ${strategyItems.map(p => `<p>${p}</p>`).join('')}
          </div>
        </div><br />
      ` : ''}
 <!-- Pre-Battle Dialogue Intro -->
      ${outroLines.length > 0 ? `
        <div class="mb-intro-box">
          <h4 class="mb-intro-title">💬 Battle conclusion</h4>
          <div class="mb-dialogue-list">
            ${outroLines.map(d => `
              <div class="mb-dialogue-line">
                <strong class="mb-speaker">${d.speaker}:</strong>
                <span class="mb-quote">"${d.line}"</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `;
}

//render duel block
// Render Single Combat Duel Card
function renderDuelCard(duelId) {
  if (!duelId && duelId !== 0) return '';

  // Look up in guideData.duel or guideData.duels
  const duelsList = guideData.duel || guideData.duels || [];
  const duel = duelsList.find(d => String(d.id) === String(duelId));

  if (!duel) return '';

  const me = duel.me || 'Hero';
  const opp = duel.opp || 'Opponent';
  const imgPath = duel.picture ? `./img/duels/${duel.picture}` : '';

  // Helper to trim trailing whitespace from dialogue lines
  const cleanQuotes = (arr) => Array.isArray(arr) ? arr.map(q => q.trim()).filter(Boolean) : [];

  const superQuotes = cleanQuotes(duel.super);
  const normalQuotes = cleanQuotes(duel.normal);
  const defendQuotes = cleanQuotes(duel.defend);

  let img = duel.picture ? `./img/duels/` + duel.picture :``;
  let bgStyle = ``;
  if(img) {
    bgStyle = `background-image: linear-gradient(rgba(15, 15, 22, 0.2), rgb(15, 15, 22)), url('`+ img + `'); background-size: cover; background-position: center center;`;
  }

  return `
    <div class="duel-card" style="${bgStyle}">
      <div class="duel-header">
        <span class="duel-badge">🗡️ DUEL</span>
        <h3 class="duel-title">${me} vs. ${opp}</h3>
      </div>

      <!-- Duel Showcase Bar -->
      <!--
      <div class="duel-matchup-bar">
        
        <div class="duel-combatants">
          <div class="combatant hero-side">
            <small>Player</small>
            <span>${me}</span>
          </div>
          <div class="duel-vs-badge">VS</div>
          <div class="combatant opp-side">
            <small>Opponent</small>
            <span>${opp}</span>
          </div>
        </div>
      </div>
      -->

      <!-- Strategy & Dialogue Reference -->
      <div class="duel-dialogue-grid">
        
        <!-- 1. Super / Wild Attack (Red Warning) -->
        ${defendQuotes.length > 0 ? `
          <div class="duel-move-block move-super">
            <div class="move-header">
              <span class="move-icon">🔥</span>
              <div>
                <strong>${opp} uses Wild Attack when he says:</strong>
                <small class="counter-tip">Counter: 🛡️ DEFEND</small>
              </div>
            </div>
            <ul class="dialogue-list">
              ${defendQuotes.map(q => `<li>"${q}"</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- 2. Normal Attack (Orange) -->
        ${superQuotes.length > 0 ? `
          <div class="duel-move-block move-normal">
            <div class="move-header">
              <span class="move-icon">⚔️</span>
              <div>
                <strong>${opp} uses Attack when he says:</strong>
                <small class="counter-tip">Counter: 🔥 WILD ATTACK</small>
              </div>
            </div>
            <ul class="dialogue-list">
              ${superQuotes.map(q => `<li>"${q}"</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- 3. Defend (Blue) -->
        ${normalQuotes.length > 0 ? `
          <div class="duel-move-block move-defend">
            <div class="move-header">
              <span class="move-icon">🛡️</span>
              <div>
                <strong>${opp} Defends when he says:</strong>
                <small class="counter-tip">Counter: ⚔️ ATTACK</small>
              </div>
            </div>
            <ul class="dialogue-list">
              ${normalQuotes.map(q => `<li>"${q}"</li>`).join('')}
            </ul>
          </div>
        ` : ''}

      </div>
    </div>
  `;
}

// Render Castle Headquarters (HQ) View
function renderHQView() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const hq = guideData.hq;
  if (!hq) {
    main.innerHTML = `<p style="padding: 20px; color: #e74c3c;">Headquarters data not found in guideData!</p>`;
    return;
  }

  const totalRecruits = guideData.recruits.length;
  const recruitedCount = userProgress.recruits ? userProgress.recruits.length : 0;
  
  let activeStageNumber = 1;
  if (recruitedCount >= 90) activeStageNumber = 4;
  else if (recruitedCount >= 45) activeStageNumber = 3;
  else if (recruitedCount >= 25) activeStageNumber = 2;

  // Calculate next upgrade threshold info
  let nextThreshold = 25;
   if (recruitedCount >= 45) nextThreshold = 90;
  else if (recruitedCount >= 25) nextThreshold = 45;

  const starsNeeded = Math.max(0, nextThreshold - recruitedCount);
const progressPercent = Math.min(100, Math.round((recruitedCount / nextThreshold) * 100));

  const bgPicture = hq.picture ? `./img/hq/${hq.picture}` : '';
  const levels = Array.isArray(hq.levels) ? hq.levels : [];
  const facilities = Array.isArray(hq.facilities) ? hq.facilities : [];

  main.innerHTML = `
    <!-- HQ Header Banner -->
    <section class="hq-header-card" ${bgPicture ? `style="background-image: linear-gradient(rgba(15, 15, 22, 0.2), rgba(15, 15, 22, 0.95)), url('${bgPicture}');"` : ''}>
      <div class="hq-header-content">
        <span class="hq-badge">🏰 CASTLE HEADQUARTERS</span>
        <h1 class="hq-title">Headquarters Upgrades & Facilities</h1>
        <p class="hq-subtitle">Track castle growth, level unlock conditions, and available facilities.</p>
      </div>
    </section>

<!-- Progress Banner -->
      <section class="hq-banner">
        <div class="hq-banner-info">
          <h2>Toran Castle Status</h2>
          <div class="hq-recruit-counter">
            <span class="count-highlight">${recruitedCount}</span> / 108 Stars Recrypted
          </div>
        </div>

        <div class="hq-progress-box">
          <div class="hq-progress-label">
            <span>Next Castle Level: <strong>${starsNeeded === 0 ? 'MAX REACHED' : `${starsNeeded} stars remaining`}</strong></span>
            <span>${progressPercent}%</span>
          </div>
          <div class="hq-progress-bar-bg">
            <div class="hq-progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
      </section>

    <!-- HQ Castle Levels Section -->
    ${levels.length > 0 ? `
      <section class="hq-section">
        <h2 class="hq-section-title">🏰 Castle Expansion Levels</h2>
        <div class="hq-levels-list">
          ${levels.map(lvl => {
          const isUnlocked = recruitedCount >= lvl.unlock;
          const isActive = lvl.id === activeStageNumber;

          let statusClass = "locked";
          let statusText = "Locked";

          if (isActive) {
            statusClass = "current";
            statusText = "Current Level";
          } else if (isUnlocked) {
            statusClass = "unlocked";
            statusText = "Unlocked";
          }

            return `
            <div class="hq-level-card">
              <div class="hq-level-header">
                <span class="hq-level-badge">Level ${lvl.id}</span>
                <span class="hq-level-unlock"><strong>Unlock:</strong> ${lvl.unlock || 'Default'}</span>
                <span class="status-pill ${statusClass}">${statusText}</span>
              </div>
              ${Array.isArray(lvl.upgrades) && lvl.upgrades.length > 0 ? `
                <div class="hq-upgrades-box">
                  <strong>Upgrades Unlocked:</strong>
                  <div class="hq-upgrade-chips">
                    ${lvl.upgrades.map(u => `<span class="hq-chip">${u}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `}).join('')}
        </div>
      </section>
    ` : ''}

    <!-- HQ Facilities Section -->
    ${facilities.length > 0 ? `
      <section class="hq-section" style="margin-top: 32px;">
        <h2 class="hq-section-title">🏪 Castle Facilities</h2>
        <div class="hq-facilities-grid">
          ${facilities.map(fac => {
            const facilityName = fac.Facility || fac.facility || 'Facility';
            const reqLevel = fac["HQ Level"] || fac.hqLevel;
            const rawUnlock = fac["Unlocked By"] || fac.unlockedBy;
            const description = fac.Description || fac.description || '';
            const recruitInfo = getRecruitInfo(rawUnlock);
const recruitId = Number(fac["Unlocked By"]);
const isFacilityUnlocked = userProgress.recruits.includes(recruitId);
            return `
              <div class="hq-facility-card">
                <div class="hq-facility-header">
                  <h3 class="facility-name">${facilityName}</h3>
                  ${reqLevel ? `<span class="facility-hq-tag">HQ Lv. ${reqLevel}</span>` : ''}
                  <span class="facility-status-pill ${isFacilityUnlocked ? 'pill-unlocked' : 'pill-locked'}">
                          ${isFacilityUnlocked ? '✓ Unlocked' : `🔒 Needs Recruit #${recruitId}`}
                        </span>
                </div>
                
                <div class="hq-facility-body">
                  <div class="facility-unlocked-by" data-recruit-key="${rawUnlock || ''}">
                    <small>Unlocked By:</small>
                    ${recruitInfo ? `
                      <div class="hq-recruit-unlock">
                        <img 
                          src="${recruitInfo.picture}" 
                          alt="${recruitInfo.name}" 
                          class="hq-recruit-thumb" 
                          onerror="this.style.display='none'"
                        />
                        <span>${recruitInfo.isStar ? '★ ' : ''}${recruitInfo.name}</span>
                      </div>
                    ` : '<span class="hq-raw-unlock">N/A</span>'}
                  </div>
                  ${description ? `<p class="facility-desc">${description}</p>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    ` : ''}
  `;

  // Attach hover pop-up event handlers
  initRecruitPopups();
  main.scrollTop = 0;
}

// Pop-up Card Mouse Hover Controller
function initRecruitPopups() {
  let popup = document.getElementById('recruit-popup-card');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'recruit-popup-card';
    popup.className = 'recruit-popup-card hidden';
    document.body.appendChild(popup);
  }

  const grid = document.querySelector('.hq-facilities-grid');
  if (!grid) return;

  grid.addEventListener('mouseover', (e) => {
    const trigger = e.target.closest('.facility-unlocked-by[data-recruit-key]');
    if (!trigger) return;

    const recruitKey = trigger.getAttribute('data-recruit-key');
    if (!recruitKey) return;

    const recruit = findRecruitData(recruitKey);
    const name = recruit ? (recruit.name || recruit.character || recruitKey) : recruitKey;
    const picture = recruit && recruit.picture ? recruit.picture : `${name}.png`;
    const star = recruit ? (recruit.star || recruit.id || '') : '';
    const location = recruit ? (recruit.location || recruit.foundAt || '') : '';
    const role = recruit ? (recruit.role || recruit.job || '') : '';
    const reqs = recruit ? (recruit.recruitment || recruit.howToRecruit || recruit.description || '') : '';

    popup.innerHTML = renderRecruitCard(recruit);

    popup.classList.remove('hidden');
  });

  grid.addEventListener('mousemove', (e) => {
    if (popup.classList.contains('hidden')) return;

    const offset = 15;
    let x = e.clientX + offset;
    let y = e.clientY + offset;

    const rect = popup.getBoundingClientRect();
    if (x + rect.width > window.innerWidth - 10) {
      x = e.clientX - rect.width - offset;
    }
    if (y + rect.height > window.innerHeight - 10) {
      y = e.clientY - rect.height - offset;
    }

    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
  });

  grid.addEventListener('mouseout', (e) => {
    const trigger = e.target.closest('.facility-unlocked-by[data-recruit-key]');
    if (trigger) {
      popup.classList.add('hidden');
    }
  });
}

// Render Collectibles Box at Chapter Start
function renderChapterCollectibles(chapterCollectibleIds = []) {
  if (!chapterCollectibleIds.length) return '';

  const checkedIds = getCheckedCollectibles();
  const allCollectibles = guideData.collectibles || [];

  // Find matching items using item.id (e.g. "Astral Predications")
  const chapterItems = chapterCollectibleIds
    .map(id => allCollectibles.find(c => c.id === id))
    .filter(Boolean);

  if (!chapterItems.length) return '';

  const chapterIdsAttr = JSON.stringify(chapterCollectibleIds).replace(/"/g, '&quot;');

  return `
    <div class="chapter-collectibles-card">
      <div class="collectibles-card-header">
        <h3>🏆 Collectibles & Key Items</h3>
        <span class="collectibles-count" id="chapter-coll-count">
          ${chapterItems.filter(i => checkedIds.includes(i.id)).length} / ${chapterItems.length} Found
        </span>
      </div>

      <ul class="chapter-collectibles-list">
        ${chapterItems.map(item => {
          const isChecked = checkedIds.includes(item.id);
          const domId = sanitizeId(item.id);
          const detailText = item.desc || item.get || '';

          return `
            <li class="chapter-collectible-item ${isChecked ? 'completed' : ''}" id="chapter-item-${domId}">
            
              <input 
                type="checkbox" 
                id="chk_${domId}" 
                ${isChecked ? 'checked' : ''}
                onchange="toggleChapterCollectible('${item.id.replace(/'/g, "\\'")}', '${chapterIdsAttr}')"
              />
              
              <label for="chk_${domId}">
                ${item.category ? `<span class="collectible-tag">${item.category}</span>` : ''}
                <strong>${item.id}</strong>
                ${detailText ? `<small>📍 ${detailText}</small>` : ''}
              </label>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
}

// Reference the central object (works with gameguide or guideData)
function getCollectiblesData() {
  return guideData.collectibles || [];
}

// Render the entire Master Collectibles View
function renderAllCollectiblesView(containerId = 'main-content') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const allItems = getCollectiblesData();
  const checkedIds = getCheckedCollectibles();

  // Extract unique categories for filter dropdown
  const categories = ['All', ...new Set(allItems.map(item => item.category || 'Uncategorized'))];

  container.innerHTML = `
    <div class="master-collectibles-view">
      <!-- Top Summary & Progress Bar -->
      <header class="master-collectibles-header">
        <h1>🏆 Master Collectibles & Items Index</h1>
        <p>Track all key items, rare equipment, and HQ collectibles across Suikoden.</p>
        
        <div class="master-progress-container">
          <div class="master-progress-bar">
            <div id="master-progress-fill" class="master-progress-fill" style="width: 0%;"></div>
          </div>
          <span id="master-progress-text" class="master-progress-text">0 / ${allItems.length} Found (0%)</span>
        </div>
      </header>

      <!-- Controls & Filter Bar -->
      <div class="collectibles-controls">
        <div class="search-box">
          <input 
            type="text" 
            id="coll-search-input" 
            placeholder="Search items, locations..." 
            oninput="filterMasterCollectibles()"
          />
        </div>

        <div class="filter-group">
          <label for="coll-category-select">Category:</label>
          <select id="coll-category-select" onchange="filterMasterCollectibles()">
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>

          <label class="toggle-completed-label">
            <input type="checkbox" id="coll-hide-completed" onchange="filterMasterCollectibles()" />
            Hide Completed
          </label>
        </div>
      </div>

      <!-- Categories Container -->
      <div id="master-collectibles-grid" class="master-collectibles-grid">
        ${renderCategoryGroups(allItems, checkedIds)}
      </div>
    </div>
  `;

  updateAllCollectiblesProgress();
  container.scrollTop = 0;
}

// Helper: Render items grouped by Category
function renderCategoryGroups(items, checkedIds) {
  if (!items.length) {
    return `<div class="empty-results">No collectibles match your search filter.</div>`;
  }

  // Group items array into object by category
  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return Object.keys(grouped).map(catName => {
    const catItems = grouped[catName];
    //const catClass = getCategoryTagClass(catName);

const catClass = [];

    return `
      <section class="master-category-card" data-category="${catName}">
        <div class="category-card-header">
          <h2>
            <span class="collectible-tag ${catClass}">${catName}</span>
          </h2>
          <span class="category-count">
            ${catItems.filter(i => checkedIds.includes(i.id)).length} / ${catItems.length}
          </span>
        </div>

        <ul class="master-items-list">
          ${catItems.map(item => {
            const isChecked = checkedIds.includes(item.id);
            const domId = sanitizeId(item.id);
            const detailText = item.desc || '';
            const detailGet =  item.get || '';

            return `
              <li 
                class="master-item-row ${isChecked ? 'completed' : ''}" 
                id="master-row-${domId}"
                data-name="${item.id.toLowerCase()}"
                data-desc="${detailText.toLowerCase()}"
                data-get="${detailGet}"
                data-status="${isChecked ? 'completed' : 'pending'}"
              >
                <input 
                  type="checkbox" 
                  id="master_chk_${domId}" 
                  ${isChecked ? 'checked' : ''}
                  onchange="toggleMasterCollectible('${item.id.replace(/'/g, "\\'")}')"
                />
                <label for="master_chk_${domId}">
                  <strong>${item.id}</strong>
                  ${detailText ? `<small>${detailText}</small>` : ''}
                  ${detailGet ? `<small>${detailGet}</small>` : ''}
                </label>
              </li>
            `;
          }).join('')}
        </ul>
      </section>
    `;
  }).join('');
}

// Interactive Toggle & Progress Updates
function toggleMasterCollectible(itemId) {
  let saved = getCheckedCollectibles();
  if (saved.includes(itemId)) {
    saved = saved.filter(id => id !== itemId);
  } else {
    saved.push(itemId);
  }
  localStorage.setItem('suiko1_collectibles', JSON.stringify(saved));

  const domId = sanitizeId(itemId);
  const row = document.getElementById(`master-row-${domId}`);
  if (row) {
    const isNowChecked = saved.includes(itemId);
    row.classList.toggle('completed', isNowChecked);
    row.dataset.status = isNowChecked ? 'completed' : 'pending';
  }

  updateAllCollectiblesProgress();
  filterMasterCollectibles(); // Re-apply "Hide Completed" filter if active
}

// Progress Bar Counter
function updateAllCollectiblesProgress() {
  const allItems = getCollectiblesData();
  if (!allItems.length) return;

  const saved = getCheckedCollectibles();
  const total = allItems.length;
  const count = saved.length;
  const pct = Math.round((count / total) * 100) || 0;

  const bar = document.getElementById('master-progress-fill');
  const text = document.getElementById('master-progress-text');

  if (bar) bar.style.width = `${pct}%`;
  if (text) text.innerText = `${count} / ${total} Found (${pct}%)`;
}

// Live Filter: Search Text + Category Dropdown + Hide Completed
function filterMasterCollectibles() {
  const query = (document.getElementById('coll-search-input')?.value || '').toLowerCase();
  const selectedCategory = document.getElementById('coll-category-select')?.value || 'All';
  const hideCompleted = document.getElementById('coll-hide-completed')?.checked || false;

  const categoryCards = document.querySelectorAll('.master-category-card');

  categoryCards.forEach(card => {
    const cardCategory = card.dataset.category;
    const categoryMatches = selectedCategory === 'All' || cardCategory === selectedCategory;

    let visibleItemCount = 0;
    const itemRows = card.querySelectorAll('.master-item-row');

    itemRows.forEach(row => {
      const name = row.dataset.name || '';
      const desc = row.dataset.desc || '';
      const isCompleted = row.dataset.status === 'completed';

      const searchMatches = name.includes(query) || desc.includes(query);
      const completionMatches = !hideCompleted || !isCompleted;

      if (categoryMatches && searchMatches && completionMatches) {
        row.style.display = 'flex';
        visibleItemCount++;
      } else {
        row.style.display = 'none';
      }
    });

    // Hide whole category box if zero matching items remain
    card.style.display = (categoryMatches && visibleItemCount > 0) ? 'block' : 'none';
  });
}

function renderUnitesView(containerId = 'main-content') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const unites = guideData?.unites || [];
  const recruits = guideData?.recruits || [];

  // Group unites by the number of participant IDs in 'stars'
  const groupedUnites = unites.reduce((acc, unite) => {
    // Split comma-separated IDs (e.g. "12, 15" -> ["12", "15"])
    const participants = String(unite.stars || '')
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

    const count = participants.length;
    if (count === 0) return acc;

    if (!acc[count]) acc[count] = [];
    acc[count].push({ ...unite, participants });
    return acc;
  }, {});

  // Sort groups numerically (2-Person, 3-Person, etc.)
  const sortedCounts = Object.keys(groupedUnites).sort((a, b) => Number(a) - Number(b));

  container.innerHTML = `
    <div class="unites-view">
      <header class="unites-header">
        <h1>⚔️ Unite Attacks Database</h1>
        <p>Discover powerful combo attacks and the recruits required to perform them.</p>
      </header>

      ${sortedCounts.map(count => `
        <section class="unites-group">
          <h2 class="unites-group-title">
            <span class="star-badge">${'★'.repeat(Number(count))}</span> ${count}-Person Unites
          </h2>
          
          <div class="unites-grid">
            ${groupedUnites[count].map(unite => renderUniteCard(unite, recruits)).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;
  container.scrollTop = 0;
}

// Render individual Unite Card with character avatars & tooltips
function renderUniteCard(unite, allRecruits) {
  return `
    <div class="unite-card">
      <div class="unite-card-header">
        <h3>${unite.name}</h3>
      </div>
      


      <div class="unite-characters">
        ${unite.participants.map(id => {
          // Find recruit by numeric or string ID match
          const recruit = allRecruits.find(r => String(r.id) === String(id));

          if (!recruit) {
            return `
              <div class="unite-char-container">
                <div class="unite-char-avatar missing">?</div>
                <span class="unite-char-name">ID #${id}</span>
              </div>
            `;
          }

          return `
            <div class="unite-char-container">
              <div class="unite-char-avatar">
                <img 
                  src="./img/stars/${recruit.name.replace(/\s/g, '') }.png" 
                  alt="${recruit.name}" 
                  onerror="this.src='img/placeholder.png'" 
                />
              </div>
              <span class="unite-char-name">${recruit.name}</span>
              
              <!-- Hover Tooltip matching your recruit fields -->
              <div class="recruit-tooltip">
                <strong>${recruit.name}</strong>
                <ul>
                  ${recruit.range ? `<li>🎯 Range: <span>${recruit.range}</span></li>` : ''}
                  ${recruit.condition ? `<li>🤝<span>${recruit.condition}</span></li>` : ''}
                </ul>
              </div>
            </div>
          `;
        }).join('<span class="unite-plus">+</span>')}
      </div>

            <div class="unite-effect">
        <strong>Effect:</strong> ${unite.effect}
      </div>
    </div>
  `;
}

/**
 * Renders a full City card
 */
function renderCity(cityKey, cityData) {
  // Parse comma-separated star string: "79,80,88"
  const starIds = cityData.stars
    ? cityData.stars.split(',').map(s => s.trim()).filter(Boolean)
    : [];

const recruits = guideData?.recruits || [];
    const participants = String(cityData.stars || '')
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

  //const starsHtml = starIds.map(id => renderStarChip(id)).join('');

  // Shops rendering
  let shopsHtml = '';
  if (cityData.shops && cityData.shops.length > 0) {
    const shopListHtml = cityData.shops.map(shop => {
      let sections = [];
      if (shop.items && shop.items.length > 0) {
        sections.push(renderShopCategory('🎒 Item Shop', shop.items));
      }
      if (shop.armor && shop.armor.length > 0) {
        sections.push(renderShopCategory('🛡️ Armor Shop', shop.armor));
      }
      return sections.join('');
    }).join('');

    shopsHtml = `<div class="rpg-shops-grid">${shopListHtml}</div>`;
  }

  return `
    <div class="rpg-box rpg-city-card" id="city-${cityKey}">
      <div class="rpg-city-header">
        <div class="rpg-city-title-group">
          <h2 class="rpg-city-title">🏰 ${escapeHtml(cityData.name)}</h2>
        </div>
        ${cityData.inn !== undefined ? `<div class="rpg-city-inn">🛌 Inn: ${cityData.inn} Bits per person.</div>` : ''}
      </div>

      ${cityData.picture ? `<img src="./img/cities/${escapeHtml(cityData.picture)}" class="rpg-city-img" alt="${escapeHtml(cityData.name)}">` : ''}


<div class="rpg-section-label">✨ Recruitable Stars</div>
<div class="rpg-stars-section">

        ${participants.map(id => {
          // Find recruit by numeric or string ID match
          const recruit = recruits.find(r => String(r.id) === String(id));
          return  renderRecruitCard(recruit);
        }).join(' ')}
        </div>
      ${shopsHtml}
    </div>
  `;
}

function renderShopCategory(title, itemList) {
  const rows = itemList.map(item => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td class="rpg-shop-price">${item.price.toLocaleString()} Bits</td>
    </tr>
  `).join('');

  return `
    <div class="rpg-shop-box">
      <div class="rpg-section-label">${title}</div>
      <table class="rpg-shop-table">
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
