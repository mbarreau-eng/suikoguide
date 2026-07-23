import { AppState } from '../state.js';
import { Storage } from '../storage.js';
import { updateProgressBar } from './sidebar.js';

export function renderCurrentChapter() {
  const main = document.getElementById('main-content');
  const chapter = AppState.getCurrentChapter();

  if (!main || !chapter) return;

  // Format numeric id directly into "Chapter X"
  const chapterLabel = typeof chapter.id === 'number' 
    ? `Chapter ${chapter.id}` 
    : (chapter.number || `Chapter ${chapter.id}`);

  const completedTasks = Storage.getCompletedTasks();

  main.innerHTML = `
    <!-- Breadcrumb Nav -->
    <nav class="breadcrumb">
      <a href="#">Home</a> &gt; <a href="#">Walkthrough</a> &gt; <span>${chapterLabel}</span>
    </nav>

    <!-- Main Chapter Header -->
    <section class="chapter-header-card">
      <div class="chapter-number">${chapterLabel}</div>
      <h1 class="chapter-title">${chapter.title}</h1>
    </section>

    <!-- Suikoden Quick Stats Bar -->
    ${(chapter.bits || chapter.savePoints || chapter.party) ? `
      <section class="notice-card" style="display: flex; gap: 24px; flex-wrap: wrap; background: var(--bg-card); border-left-color: var(--text-gold);">
        ${chapter.bits ? `
          <div>
            <span style="color: var(--text-gold); font-weight: bold;">Bits:</span> 
            ${Array.isArray(chapter.bits) ? chapter.bits.join(', ') : chapter.bits}
          </div>
        ` : ''}
        
        ${chapter.savePoints ? `
          <div>
            <span style="color: var(--text-gold); font-weight: bold;">Save Points:</span> 
            ${chapter.savePoints.join(', ')}
          </div>
        ` : ''}

        ${chapter.party ? `
          <div>
            <span style="color: var(--text-gold); font-weight: bold;">Party:</span> 
            ${chapter.party.map(p => `${p.name} (Lv.${p.level})`).join(', ')}
          </div>
        ` : ''}
      </section>
    ` : ''}

    <!-- Content Sections & Tasks -->
    ${chapter.sections ? chapter.sections.map((sec, idx) => `
      <section class="paragraph-block">
        ${sec.title ? `<h3 style="color: var(--text-gold); margin-bottom: 8px;">${sec.title}</h3>` : ''}
        ${sec.text ? `<p>${sec.text}</p>` : ''}
        
        ${sec.tasks ? `
          <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
            ${sec.tasks.map((task, tIdx) => {
              const taskId = typeof task === 'object' ? task.id : `task-${chapter.id}-${idx}-${tIdx}`;
              const taskText = typeof task === 'object' ? task.text : task;
              return `
                <label style="display: flex; gap: 10px; cursor: pointer;">
                  <input type="checkbox" 
                         class="task-checkbox" 
                         data-task-id="${taskId}"
                         ${completedTasks.includes(taskId) ? 'checked' : ''}>
                  <span>${taskText}</span>
                </label>
              `;
            }).join('')}
          </div>
        ` : ''}
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