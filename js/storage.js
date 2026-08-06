// Local Storage Keys
const STORAGE_PROGRESS_KEY = 'suiko_progress_data';
const STORAGE_THEME_KEY = 'suiko_theme';
const STORAGE_STYLE_KEY = 'suiko_style';
const STORAGE_CHAPTER_KEY = 'suiko_chapter';
let currentChapterId = loadSavedChapter() || 1;
let userProgress = loadProgress();
let activeTab = 'walkthrough';


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
    const parsed = parseInt(data, 10);
    return isNaN(parsed) ? 1 : parsed;
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
  
  const strKey = parseInt(key, 10) || key;
  const index = userProgress[category].indexOf(strKey);

  if (index > -1) {
    userProgress[category].splice(index, 1);
  } else {
    userProgress[category].push(strKey);
  }

  saveProgress();
  renderCurrentChapter(false);
}

function isChecked(category, key) {
  if (!userProgress[category]) return false;
  return userProgress[category].includes(key) || userProgress[category].includes(parseInt(key, 10));
}

// Theme Handling
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

// Style Handling
function initStyle() {
  const savedTheme = localStorage.getItem(STORAGE_STYLE_KEY) || 'original';
  document.documentElement.setAttribute('data-style', savedTheme);
}

function toggleStyle() {
  const current = document.documentElement.getAttribute('data-style') || 'original';
  const newStyle = current === 'original' ? 'remaster' : 'original';
  document.documentElement.setAttribute('data-style', newStyle);
  localStorage.setItem(STORAGE_STYLE_KEY, newStyle);
  updateStyleButtonUI(newStyle);
}

function updateStyleButtonUI(theme) {
  const btn = document.getElementById('style-toggle-btn');
  if (btn) {
    btn.innerHTML = theme === 'original' ? '● Remaster Style' : '■ PS1 Style';
  }
}

// Collectibles Local Storage
function getCheckedCollectibles() {
  return JSON.parse(localStorage.getItem('suiko1_collectibles') || '[]');
}

function toggleChapterCollectible(itemId, chapterIdsJson) {
  let saved = getCheckedCollectibles();
  if (saved.includes(itemId)) {
    saved = saved.filter(id => id !== itemId);
  } else {
    saved.push(itemId);
  }
  localStorage.setItem('suiko1_collectibles', JSON.stringify(saved));

  const domId = sanitizeId(itemId);
  const row = document.getElementById(`chapter-item-${domId}`);
  if (row) row.classList.toggle('completed');

  const chapterIds = JSON.parse(chapterIdsJson);
  const countSpan = document.getElementById('chapter-coll-count');
  if (countSpan) {
    const foundCount = chapterIds.filter(cId => saved.includes(cId)).length;
    countSpan.innerText = `${foundCount} / ${chapterIds.length} Found`;
  }
}

function toggleMasterCollectible(itemId) {
  let saved = getCheckedCollectibles();
  if (saved.includes(itemId)) {
    saved = saved.filter(id => id !== itemId);
  } else {
    saved.push(itemId);
  }
  localStorage.setItem('suiko1_collectibles', JSON.stringify(saved));

  const domId = sanitizeId(itemId);
  const row = document.getElementById(`master-row-${domId}`);
  if (row) {
    const isNowChecked = saved.includes(itemId);
    row.classList.toggle('completed', isNowChecked);
    row.dataset.status = isNowChecked ? 'completed' : 'pending';
  }

  updateAllCollectiblesProgress();
  filterMasterCollectibles();
}