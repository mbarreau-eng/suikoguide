import { Storage } from '../storage.js';

export function initHeader() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  // Apply saved theme on boot
  const currentTheme = Storage.getTheme();
  document.body.setAttribute('data-theme', currentTheme);
  updateThemeUI(currentTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', newTheme);
      Storage.setTheme(newTheme);
      updateThemeUI(newTheme);
    });
  }

  function updateThemeUI(theme) {
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (themeText) themeText.textContent = theme === 'dark' ? 'Light' : 'Dark';
  }
}