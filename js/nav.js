function switchView(viewName) {
  const sidebar = document.getElementById('sidebar-nav') || document.getElementById('sidebar');

  const divTrackables = document.getElementById('trackables');
  divTrackables.innerHTML = '';

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
      /*
    case 'hq':
      renderHQView('main-content');
      break;  
      */
    case 'collectibles':
      renderAllCollectiblesView();
      break;  
    case 'unites':
      renderUnitesView();
      break;  
     case 'map':
      renderWorldMap();
      break;    
    default:
      console.warn(`Unknown view: ${viewName}. Defaulting to walkthrough.`);
      renderCurrentChapter();
      break;
  }
}

