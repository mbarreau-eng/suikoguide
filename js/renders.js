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
  controlsContainer.innerHTML += `
    <button id="theme-toggle-btn" class="theme-btn" onclick="toggleTheme()">
      ${currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  `;

  const currentStyle = document.documentElement.getAttribute('data-style') || 'original';
  controlsContainer.innerHTML += `
    <button id="style-toggle-btn" class="theme-btn" onclick="toggleStyle()">
      ${currentStyle === 'original' ? '● Remaster Style' : '■ PS1 Style'}
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
        <span>👾 Bestiary</span>
      </button>

      <button class="nav-btn-main" data-view="recruits">
        <span>★ 108 Stars</span>
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

function renderCurrentChapter(toTop = true) {
  const main = document.getElementById('main-content');
  const trackables = document.getElementById('trackables');
  trackables.innerHTML = '';
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
      renderChapterView(main, currentChapterId, toTop);
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
  
}

function renderContent() {
  renderCurrentChapter();
}
