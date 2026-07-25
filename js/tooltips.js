function initEnemyTooltip() {
  if (!document.getElementById('enemy-tooltip')) {
    const tooltip = document.createElement('div');
    tooltip.id = 'enemy-tooltip';
    document.body.appendChild(tooltip);
  }
}

function showEnemyTooltip(enemyName, mouseEvent) {
  const tooltip = document.getElementById('enemy-tooltip');
  if (!tooltip || !guideData.enemies) return;

  const cleanName = enemyName.replace(/^[\s★⚔️👾]+/g, '').trim();
  const enemyData = guideData.enemies[0]?.[cleanName];

  if (!enemyData) return;

  tooltip.innerHTML = renderEnemyCard(cleanName, enemyData);
  tooltip.classList.add('visible');
  positionEnemyTooltip(mouseEvent);
}

function positionEnemyTooltip(e) {
  const tooltip = document.getElementById('enemy-tooltip');
  if (!tooltip || !tooltip.classList.contains('visible')) return;

  const offset = 16;
  let left = e.clientX + offset;
  let top = e.clientY + offset;

  const rect = tooltip.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  if (left + rect.width > windowWidth - 10) left = e.clientX - rect.width - offset;
  if (top + rect.height > windowHeight - 10) top = e.clientY - rect.height - offset;

  tooltip.style.left = `${Math.max(10, left)}px`;
  tooltip.style.top = `${Math.max(10, top)}px`;
}

function hideEnemyTooltip() {
  const tooltip = document.getElementById('enemy-tooltip');
  if (tooltip) tooltip.classList.remove('visible');
}

function initRecruitPopups() {
  let popup = document.getElementById('recruit-popup-card');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'recruit-popup-card';
    popup.className = 'recruit-popup-card hidden';
    document.body.appendChild(popup);
  }

  const grid = document.querySelector('.hq-facilities-grid');
  if (!grid) return;

  grid.addEventListener('mouseover', (e) => {
    const trigger = e.target.closest('.facility-unlocked-by[data-recruit-key]');
    if (!trigger) return;

    const recruitKey = trigger.getAttribute('data-recruit-key');
    if (!recruitKey) return;

    const recruit = findRecruitData(recruitKey);
    popup.innerHTML = renderRecruitCard(recruit || recruitKey);
    popup.classList.remove('hidden');
  });

  grid.addEventListener('mousemove', (e) => {
    if (popup.classList.contains('hidden')) return;

    const offset = 15;
    let x = e.clientX + offset;
    let y = e.clientY + offset;

    const rect = popup.getBoundingClientRect();
    if (x + rect.width > window.innerWidth - 10) x = e.clientX - rect.width - offset;
    if (y + rect.height > window.innerHeight - 10) y = e.clientY - rect.height - offset;

    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
  });

  grid.addEventListener('mouseout', (e) => {
    const trigger = e.target.closest('.facility-unlocked-by[data-recruit-key]');
    if (trigger) popup.classList.add('hidden');
  });
}