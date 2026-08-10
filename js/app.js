// Global guideData baseline
const guideData = { collectibles: [], chapters: [] };
const gameID = sessionStorage.getItem('game') || 'S1';

// Application Data & Module Scripts Loader
const dataFiles = [
  './' + gameID + '/data/collectibles.js',
  './' + gameID + '/data/enemies.js',
  './' + gameID + '/data/recruits.js',
  './' + gameID + '/data/major.js',
  './' + gameID + '/data/duel.js',
  './' + gameID + '/data/hq.js',
  './' + gameID + '/data/unites.js',
  './' + gameID + '/data/cities.js',
  './' + gameID + '/data/chapters/ch00.js',
  './' + gameID + '/data/chapters/ch01.js',
  './' + gameID + '/data/chapters/ch02.js',
  './' + gameID + '/data/chapters/ch03.js',
  './' + gameID + '/data/chapters/ch04.js',
  './' + gameID + '/data/chapters/ch05.js',
  './' + gameID + '/data/chapters/ch06.js',
  './' + gameID + '/data/chapters/ch07.js',
  './' + gameID + '/data/chapters/ch08.js',
  './' + gameID + '/data/chapters/ch09.js',
  './' + gameID + '/data/chapters/ch10.js',
  './' + gameID + '/data/chapters/ch11.js',
  './' + gameID + '/data/chapters/ch12.js',
  './' + gameID + '/data/chapters/ch13.js',
  './' + gameID + '/data/chapters/ch14.js',
  './' + gameID + '/data/chapters/ch15.js',
  './' + gameID + '/data/chapters/ch16.js',
  './' + gameID + '/data/chapters/ch17.js',
  './' + gameID + '/data/chapters/ch18.js',
  './' + gameID + '/data/chapters/ch19.js',
  './' + gameID + '/data/chapters/ch20.js',
  './' + gameID + '/data/chapters/ch21.js',
  './' + gameID + '/data/chapters/ch22.js',
  './' + gameID + '/data/chapters/ch23.js',
  './' + gameID + '/data/chapters/ch24.js',
  './' + gameID + '/data/chapters/ch25.js',
  './' + gameID + '/data/chapters/ch26.js',
  './' + gameID + '/data/chapters/ch27.js',
  './' + gameID + '/data/chapters/ch28.js',
  './' + gameID + '/data/chapters/ch29.js',
  './' + gameID + '/data/chapters/ch30.js',
  './' + gameID + '/data/chapters/ch31.js',
  './' + gameID + '/data/chapters/ch32.js',
];
/*
if(gameID === 'S2') {
  dataFiles.push(
    './' + gameID + '/data/chapters/ch33.js',
    './' + gameID + '/data/chapters/ch34.js',
    './' + gameID + '/data/chapters/ch35.js',
    './' + gameID + '/data/chapters/ch36.js',
    './' + gameID + '/data/chapters/ch37.js',
    './' + gameID + '/data/chapters/ch38.js',
    './' + gameID + '/data/chapters/ch39.js',
  )
}
*/

  dataFiles.push(
  // Application Modular Scripts
  './js/events.js',
  './js/nav.js',
  './js/storage.js',
  './js/helpers.js',
  './js/tooltips.js',
  './js/renders.js',
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
  );

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
  initStyle();

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

// Kick off Script Loading on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  loadScripts(dataFiles)
    .then(() => {
      console.log('All modules loaded successfully!');
      initApp();
    })
    .catch(err => console.error(err));
});