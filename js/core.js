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