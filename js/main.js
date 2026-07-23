import { initHeader } from './components/header.js';
import { initSidebar } from './components/sidebar.js';
import { renderCurrentChapter } from './components/chapter.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize top header (theme toggle, version badge)
  initHeader();

  // 2. Initialize sidebar & pass callback when user switches chapters
  initSidebar(() => {
    renderCurrentChapter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 3. Render initial chapter on load
  renderCurrentChapter();
});