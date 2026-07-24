 const guideData = { collectibles: [], chapters: [] };

// Files to load in order
const dataFiles = [
  './data/collectibles.js',
  './data/chapters/ch01.js',
  './data/chapters/ch02.js',
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