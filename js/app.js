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



// Start app when DOM loads
window.addEventListener('DOMContentLoaded', initApp);

