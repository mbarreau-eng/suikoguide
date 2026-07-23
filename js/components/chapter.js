import { AppState } from '../state.js';
import { Storage } from '../storage.js';
import { updateProgressBar } from './sidebar.js';

// Helper to format numeric or string IDs into "Chapter X"
function getChapterLabel(chapter) {
  if (!chapter) return 'Chapter';
  if (typeof chapter.id === 'number') return `Chapter ${chapter.id}`;
  if (chapter.number) return chapter.number;
  const match = String(chapter.id).match(/ch?(\d+)/i);
  return match ? `Chapter ${match[1]}` : `Chapter ${chapter.id}`;
}

export function renderCurrentChapter() {
  const main = document.getElementById('main-content');
  const chapter = AppState.getCurrentChapter();

  if (!main || !chapter) return;

  const chapterLabel = getChapterLabel(chapter);
  const completedTasks = Storage.getCompletedTasks();

  // Normalize data arrays (handles singular vs plural / alternative names)
  const partyList = chapter.party || chapter.team || [];
  const recruitsList = chapter.recruits || chapter.stars || [];
  const savePoints = chapter.savePoints || chapter.saves || [];
  const bitsInfo = chapter.bits;
  const mainSections = chapter.sections || chapter.content || chapter.paragraphs || [];
  const topText = chapter.text || chapter.summary || chapter.overview || '';
  const notesList = chapter.notes || chapter.warnings || chapter.notices || [];
  const bossList = chapter.bosses || chapter.bossFights || [];
  const choicesList = chapter.choices || chapter.decisions || [];

  main.innerHTML = `
    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <a href="#">Home</a> &gt; <a href="#">Walkthrough</a> &gt; <span>${chapterLabel}</span>
    </nav>

    <!-- Chapter Header -->
    <section class="chapter-header-card">
      <div class="chapter-number">${chapterLabel}</div>
      <h1 class="chapter-title">${chapter.title || 'Untitled Chapter'}</h1>
      ${topText ? `<p style="margin-top: 8px; color: var(--text-main);">${topText}</p>` : ''}
    </section>

    <!-- Meta Information Grid (Party, Bits, Save Points, Recruits) -->
    ${(partyList.length > 0 || bitsInfo || savePoints.length > 0 || recruitsList.length > 0) ? `
      <section class="notice-card" style="display: flex; flex-direction: column; gap: 12px; background: var(--bg-card); border-left: 4px solid var(--text-gold);">
        
        ${partyList.length > 0 ? `
          <div>
            <strong style="color: var(--text-gold);">Active Party:</strong>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
              ${partyList.map(member => `
                <span class="enemy-chip" style="border-color: var(--text-gold); color: var(--text-bright);">
                  ${typeof member === 'object' ? `${member.name} ${member.level ? `(Lv.${member.level})` : ''}` : member}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${recruitsList.length > 0 ? `
          <div>
            <strong style="color: var(--accent-green);">Recruits Available:</strong>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
              ${recruitsList.map(rec => `
                <span class="recruit-chip">
                  ★ ${typeof rec === 'object' ? rec.name : rec}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${(bitsInfo || savePoints.length > 0) ? `
          <div style="display: flex; gap: 20px; flex-wrap: wrap; font-size: 0.9rem; margin-top: 4px; border-top: 1px solid var(--border-color); padding-top: 8px;">
            ${bitsInfo ? `<div><strong style="color: var(--text-gold);">Bits:</strong> ${Array.isArray(bitsInfo) ? bitsInfo.join(', ') : bitsInfo}</div>` : ''}
            ${savePoints.length > 0 ? `<div><strong style="color: var(--text-gold);">Save Points:</strong> ${savePoints.join(', ')}</div>` : ''}
          </div>
        ` : ''}

      </section>
    ` : ''}

    <!-- Warnings & Notes -->
    ${notesList.map(note => `
      <section class="notice-card notice-warning">
        <div class="notice-title">Important Note</div>
        <p>${typeof note === 'object' ? note.text || note.message : note}</p>
      </section>
    `).join('')}

    <!-- Main Content Sections / Paragraphs / Tasks -->
    ${Array.isArray(mainSections) ? mainSections.map((sec, secIdx) => {
      const secTitle = sec.title || sec.header || '';
      const secText = typeof sec === 'string' ? sec : (sec.text || sec.content || sec.body || '');
      const secTasks = sec.tasks || sec.checklists || [];
      const secItems = sec.items || sec.chests || [];

      return `
        <section class="paragraph-block">
          ${secTitle ? `<h3 style="color: var(--text-gold); font-family: var(--font-serif); font-size: 1.2rem; margin-bottom: 8px;">${secTitle}</h3>` : ''}
          ${secText ? `<p style="line-height: 1.6; color: var(--text-main);">${secText}</p>` : ''}

          <!-- Found Items -->
          ${secItems.length > 0 ? `
            <div style="margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
              <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: bold;">Items:</span>
              ${secItems.map(item => `<mark class="item-tag">${item}</mark>`).join(' ')}
            </div>
          ` : ''}

          <!-- Section Tasks / Checkboxes -->
          ${secTasks.length > 0 ? `
            <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px; border-top: 1px dashed var(--border-color); padding-top: 10px;">
              ${secTasks.map((task, tIdx) => {
                const taskId = typeof task === 'object' ? task.id : `task-${chapter.id}-${secIdx}-${tIdx}`;
                const taskText = typeof task === 'object' ? task.text : task;
                const isChecked = completedTasks.includes(taskId);

                return `
                  <label style="display: flex; gap: 10px; align-items: flex-start; cursor: pointer;">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           data-task-id="${taskId}"
                           ${isChecked ? 'checked' : ''}
                           style="margin-top: 4px;">
                    <span style="${isChecked ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${taskText}</span>
                  </label>
                `;
              }).join('')}
            </div>
          ` : ''}
        </section>
      `;
    }).join('') : ''}

    <!-- Key Decisions / Choices -->
    ${choicesList.map(choice => `
      <section class="choices-card">
        <div class="choices-header">${choice.title || 'Key Decision'}</div>
        ${(choice.options || []).map((opt, optIdx) => `
          <div class="choice-option-box">
            <div class="choice-option-title">${optIdx + 1}. ${typeof opt === 'object' ? opt.text || opt.title : opt}</div>
            ${opt.outcome ? `<p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">${opt.outcome}</p>` : ''}
          </div>
        `).join('')}
      </section>
    `).join('')}

    <!-- Boss Fights -->
    ${bossList.map(boss => `
      <section class="boss-card">
        <div class="boss-header">
          <span class="boss-title">Boss: ${boss.name || 'Encounter'}</span>
          ${boss.hp ? `<span style="font-size: 0.8rem; background: var(--accent-red); color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;">HP: ${boss.hp}</span>` : ''}
        </div>
        <div class="boss-body">
          ${boss.image ? `<img src="${boss.image}" alt="${boss.name}" class="boss-img">` : ''}
          <div>
            ${boss.strategy ? `<p><strong>Strategy:</strong> ${boss.strategy}</p>` : ''}
            ${boss.drops ? `<p style="font-size: 0.88rem; margin-top: 6px; color: var(--text-muted);"><strong>Reward/Drops:</strong> ${Array.isArray(boss.drops) ? boss.drops.join(', ') : boss.drops}</p>` : ''}
          </div>
        </div>
      </section>
    `).join('')}

    <!-- Chapter Footer Navigation -->
    <footer class="chapter-footer-nav">
      <button id="prev-chapter-btn" class="nav-chapter-btn">&larr; Previous Chapter</button>
      <button id="next-chapter-btn" class="nav-chapter-btn">Next Chapter &rarr;</button>
    </footer>
  `;

  // Attach interactive checkbox handlers
  main.querySelectorAll('.task-checkbox').forEach(box => {
    box.addEventListener('change', () => {
      const taskId = box.getAttribute('data-task-id');
      Storage.toggleTask(taskId);
      updateProgressBar();
      renderCurrentChapter(); // Re-render to update strike-through styles
    });
  });

  // Attach Chapter Navigation Button Handlers
  const prevBtn = document.getElementById('prev-chapter-btn');
  const nextBtn = document.getElementById('next-chapter-btn');

  const currentIndex = AppState.guide.chapters.findIndex(ch => ch.id == chapter.id);

  if (prevBtn) {
    if (currentIndex <= 0) {
      prevBtn.disabled = true;
      prevBtn.style.opacity = '0.4';
      prevBtn.style.cursor = 'not-allowed';
    } else {
      prevBtn.addEventListener('click', () => {
        const prevId = AppState.guide.chapters[currentIndex - 1].id;
        AppState.setChapter(prevId);
        renderCurrentChapter();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  if (nextBtn) {
    if (currentIndex >= AppState.guide.chapters.length - 1) {
      nextBtn.disabled = true;
      nextBtn.style.opacity = '0.4';
      nextBtn.style.cursor = 'not-allowed';
    } else {
      nextBtn.addEventListener('click', () => {
        const nextId = AppState.guide.chapters[currentIndex + 1].id;
        AppState.setChapter(nextId);
        renderCurrentChapter();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
}