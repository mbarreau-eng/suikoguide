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


  
  document.getElementById('trackables').addEventListener('click', (e) => {
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
 
    const leftPanel = document.getElementById("left-panel");
    const toggleBtn = document.getElementById("toggle-btn");

    toggleBtn.addEventListener("click", () => {
      leftPanel.classList.toggle("collapsed");
      toggleBtn.innerText = toggleBtn.innerText === "<" ? ">" : "<";
    });

  
}