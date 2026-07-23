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
  document.getElementById('main-container').addEventListener('click', (e) => {
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
        currentChapterId = rawId;

        // Highlight active chapter
        sidebar.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
        chapterLink.classList.add('active');

        // Render selected chapter & scroll up
        if (typeof switchView === 'function') {
          switchView('walkthrough');
        } else {
          renderCurrentChapter();
        }
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

    default:
      console.warn(`Unknown view: ${viewName}. Defaulting to walkthrough.`);
      if (typeof renderCurrentChapter === 'function') {
        renderCurrentChapter();
      }
      break;
  }
}
// Start app when DOM loads
window.addEventListener('DOMContentLoaded', initApp);

