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










// Kick off Script Loading on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  loadScripts(dataFiles)
    .then(() => {
      console.log('All modules loaded successfully!');
      initApp();
    })
    .catch(err => console.error(err));
});