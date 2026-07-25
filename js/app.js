// Global guideData baseline
const guideData = { collectibles: [], chapters: [] };

// Application Data & Module Scripts Loader
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
  // Application Modular Scripts
  './js/storage.js',
  './js/helpers.js',
  './js/tooltips.js',
  './js/components/chapter.components.js',
  './js/components/cities.components.js',
  './js/components/enemies.components.js',
  './js/components/recruits.components.js',
  './js/components/unites.components.js',
  './js/views/chapter.view.js',
  './js/views/recruits.view.js',
  './js/views/enemies.view.js',
  './js/views/hq.view.js',
  './js/views/collectibles.view.js',
  './js/views/unites.view.js',
  './js/views/city.view.js'
];

function loadScripts(files) {
  return files.reduce((promise, src) => {
    return promise.then(() => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    }));
  }, Promise.resolve());
}

// Application Global State


function initApp() {

  let userProgress = loadProgress();
let currentChapterId = loadSavedChapter();
var activeTab = 'walkthrough';
  initTheme();

  if (typeof guideData === 'undefined' || !guideData) {
    document.getElementById('main-content').innerHTML = `
      <div class="empty-state">
        <h3>Unable to load guide data</h3>
        <p>Make sure all data files in <code>/data/</code> are available.</p>
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
  // Global Event Delegation for interactive progress tracking
  document.getElementById('main-content').addEventListener('click', (e) => {
    const trackable = e.target.closest('[data-track-cat]');
    if (trackable) {
      if (e.target.tagName.toLowerCase() === 'label') return;
      e.stopPropagation();
      const cat = trackable.getAttribute('data-track-cat');
      const key = trackable.getAttribute('data-track-key');
      toggleProgress(cat, key);
    }
  });

  // Initialize tooltips
  initEnemyTooltip();

  // GLOBAL HOVER DELEGATION FOR ENEMIES/BOSSES
  document.addEventListener('mouseover', (e) => {
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
      // Accordion Header Toggle
      const toggleBtn = e.target.closest('.accordion-toggle');
      if (toggleBtn) {
        const group = toggleBtn.closest('.accordion-group');
        group.classList.toggle('expanded');
        return;
      }

      // Click Chapter Link
      const chapterLink = e.target.closest('.nav-item[data-chapter-id]');
      if (chapterLink) {
        e.preventDefault();
        const rawId = chapterLink.getAttribute('data-chapter-id');
        currentChapterId = parseInt(rawId, 10);
        saveCurrentChapter();
        
        sidebar.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
        chapterLink.classList.add('active');

        switchView('walkthrough');
        renderCurrentChapter();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Click Main View Buttons
      const viewBtn = e.target.closest('.nav-btn-main[data-view]');
      if (viewBtn) {
        const viewName = viewBtn.getAttribute('data-view');
        switchView(viewName);
      }

      // Click Cities
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
  document.getElementById('tab-walkthrough')?.classList.toggle('active', tab === 'walkthrough');
  document.getElementById('tab-recruits')?.classList.toggle('active', tab === 'recruits');
  document.getElementById('tab-enemies')?.classList.toggle('active', tab === 'enemies');
  renderSidebar();
  renderContent();
}

function selectChapter(id) {
  currentChapterId = id;
  if (activeTab !== 'walkthrough') switchTab('walkthrough');
  renderSidebar();
  renderContent();
}

function switchView(viewName) {
  const sidebar = document.getElementById('sidebar-nav') || document.getElementById('sidebar');

  if (sidebar) {
    sidebar.querySelectorAll('.nav-btn-main').forEach(btn => btn.classList.remove('active'));

    if (viewName !== 'walkthrough') {
      sidebar.querySelectorAll('.nav-item').forEach(link => link.classList.remove('active'));
      const targetBtn = sidebar.querySelector(`.nav-btn-main[data-view="${viewName}"]`);
      if (targetBtn) targetBtn.classList.add('active');
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  activeTab = viewName;

  switch (viewName) {
    case 'walkthrough':
      renderCurrentChapter();
      break;
    case 'enemies':
      renderEnemiesView();
      break;
    case 'recruits':
      renderRecruitsView(document.getElementById('main-content'));
      break;
    case 'hq':
      renderHQView();
      break;  
    case 'collectibles':
      renderAllCollectiblesView();
      break;  
    case 'unites':
      renderUnitesView();
      break;  
    default:
      console.warn(`Unknown view: ${viewName}. Defaulting to walkthrough.`);
      renderCurrentChapter();
      break;
  }
}

function renderSidebarControls() {
  const sidebar = document.querySelector('.sidebar') || document.getElementById('sidebar');
  if (!sidebar) return;

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

function renderSidebar() {
  const sidebar = document.getElementById('sidebar-nav') || document.getElementById('sidebar');
  if (!sidebar) return;

  const chapters = guideData.chapters || [];
  const cities = guideData.cities || [];

  sidebar.innerHTML = `
    <nav class="sidebar-accordion">
      <div class="accordion-group expanded" id="group-walkthrough">
        <button class="accordion-toggle" id="toggle-walkthrough">
          <span>📖 Walkthrough</span>
          <span class="accordion-arrow">▼</span>
        </button>
        
        <div class="accordion-menu" id="chapter-sub-menu">
          ${chapters.map(ch => {
            const label = getChapterLabel(ch);
            const isActive = String(ch.id) === String(currentChapterId);
            return `
              <a href="#" class="nav-item ${isActive ? 'active' : ''}" data-chapter-id="${ch.id}">
                ${label}
              </a>
            `;
          }).join('')}
        </div>
      </div>

      <button class="nav-btn-main" data-view="enemies">
        <span>👾 Enemies / Bestiary</span>
      </button>

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

      <div class="accordion-group" id="group-cities">
        <button class="accordion-toggle" id="toggle-cities">
          <span>🛖 Cities</span>
          <span class="accordion-arrow">▼</span>
        </button>
        
        <div class="accordion-menu" id="city-sub-menu">
          ${cities.map((c, index) => `
            <a href="#" class="nav-item" data-city-id="${index}">
              ${c.name}
            </a>
          `).join('')}
        </div>
      </div>
    </nav>
  `;
}

function renderCurrentChapter() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const chapter = (guideData.chapters || []).find(
    ch => String(ch.id) === String(currentChapterId)
  ) || guideData.chapters?.[0];

  if (!chapter) {
    main.innerHTML = `<p style="padding: 20px; color: #e74c3c;">Chapter ${currentChapterId} not found in guideData!</p>`;
    return;
  }

  activeTab = activeTab || 'walkthrough';

  switch (activeTab) {
    case 'walkthrough':
      renderChapterView(main, currentChapterId);
      break;
    case 'enemies':
      renderEnemiesView();
      break;
    case 'recruits':
      renderRecruitsView(main);
      break;
    case 'hq':
      renderHQView();
      break;  
    case 'collectibles':
      renderAllCollectiblesView();
      break;  
    case 'unites':
      renderUnitesView();
      break;  
    default:
      renderChapterView(main, 1);
      break;
  }
  main.scrollTop = 0;
}

function renderContent() {
  renderCurrentChapter();
}

// Kick off Script Loading on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  loadScripts(dataFiles)
    .then(() => {
      console.log('All modules loaded successfully!');
      initApp();
    })
    .catch(err => console.error(err));
});