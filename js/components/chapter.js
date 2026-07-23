import { AppState } from '../state.js';
import { Storage } from '../storage.js';
import { updateProgressBar } from './sidebar.js';

export function renderCurrentChapter() {
  const main = document.getElementById('main-content');
  const chapter = AppState.getCurrentChapter();

  console.log("Active Chapter Data:", chapter);

  if (!main || !chapter) return;

  const completedTasks = Storage.getCompletedTasks();

  main.innerHTML = `
    <!-- Breadcrumbs -->
    <nav class="breadcrumb">
      <a href="#">Home</a> &gt; <a href="#">Walkthrough</a> &gt; <span>${chapter.number}</span>
    </nav>

    <!-- Chapter Header -->
    <section class="chapter-header-card">
      <div class="chapter-number">${chapter.number}</div>
      <h1 class="chapter-title">${chapter.title}</h1>
      <p>${chapter.summary || ''}</p>
    </section>

    <!-- Interactive Tasks Checklist -->
    ${chapter.tasks ? `
      <section class="paragraph-block">
        <h3 style="color: var(--text-gold); font-size: 0.95rem; margin-bottom: 10px;">OBJECTIVES</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${chapter.tasks.map(task => `
            <label style="display: flex; gap: 10px; cursor: pointer;">
              <input type="checkbox" 
                     class="task-checkbox" 
                     data-task-id="${task.id}"
                     ${completedTasks.includes(task.id) ? 'checked' : ''}>
              <span>${task.text}</span>
            </label>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Places & Enemies -->
    ${chapter.places ? chapter.places.map(place => `
      <section class="place-card">
        <h2 class="place-header">${place.name}</h2>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
          ${place.enemies.map(enemy => `<span class="enemy-chip">${enemy}</span>`).join('')}
        </div>
      </section>
    `).join('') : ''}

    <!-- Boss Fights -->
    ${chapter.bosses ? chapter.bosses.map(boss => `
      <section class="boss-card">
        <div class="boss-header">
          <span class="boss-title">Boss: ${boss.name}</span>
          <span style="font-size: 0.8rem; background: var(--accent-red); color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: bold;">HP: ${boss.hp}</span>
        </div>
        <div class="boss-body">
          <p><strong>Strategy:</strong> ${boss.strategy}</p>
        </div>
      </section>
    `).join('') : ''}
  `;

  // Attach interactive checkbox listeners
  main.querySelectorAll('.task-checkbox').forEach(box => {
    box.addEventListener('change', () => {
      const taskId = box.getAttribute('data-task-id');
      Storage.toggleTask(taskId);
      updateProgressBar();
    });
  });
}