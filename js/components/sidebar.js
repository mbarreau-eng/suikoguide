import { AppState } from '../state.js';
import { Storage } from '../storage.js';

export function initSidebar(onChapterChange) {
  renderSidebarNav(onChapterChange);
  updateProgressBar();

  const searchInput = document.getElementById('walkthrough-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.setSearchQuery(e.target.value);
    });
  }
}

export function renderSidebarNav(onChapterChange) {
  const navList = document.getElementById('sidebar-nav-list');
  if (!navList) return;

  navList.innerHTML = AppState.guide.chapters.map(ch => `
    <li>
      <a href="#chapter-${ch.id}" 
         class="nav-item ${ch.id == AppState.currentChapterId ? 'active' : ''}" 
         data-chapter-id="${ch.id}">
        ${ch.title}
      </a>
    </li>
  `).join('');

  // Attach click handlers
  navList.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const rawId = link.getAttribute('data-chapter-id');
      
      AppState.setChapter(rawId);
      
      navList.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      link.classList.add('active');

      onChapterChange(AppState.currentChapterId);
    });
  });
}

export function updateProgressBar() {
  const completed = Storage.getCompletedTasks();
  
  // Calculate total tasks across chapters
  const totalTasks = AppState.guide.chapters.reduce((acc, ch) => {
    if (ch.sections) {
      return acc + ch.sections.reduce((sAcc, sec) => sAcc + (sec.tasks ? sec.tasks.length : 0), 0);
    }
    return acc + (ch.tasks ? ch.tasks.length : 0);
  }, 0) || 1;

  const percentage = Math.round((completed.length / totalTasks) * 100);

  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-value');

  if (fill) fill.style.width = `${percentage}%`;
  if (text) text.textContent = `${percentage}%`;
}