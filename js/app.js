// State variables


// Local Storage Keys
const STORAGE_PROGRESS_KEY = 'suiko_progress_data';
const STORAGE_THEME_KEY = 'suiko_theme';
const STORAGE_CHAPTER_KEY = 'suiko_chapter';

// Load User Progress from localStorage
let userProgress = loadProgress();
let currentChapterId = loadSavedChapter();

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

