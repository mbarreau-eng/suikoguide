function renderRangeBadge(range) {
  if (!range) return '';
  const r = String(range).trim().toUpperCase();

  if (r === 'NP') {
    return `<span class="range-badge range-np" title="Non-Playable / Support Staff">NP</span>`;
  }
  return `<span class="range-badge range-${r.toLowerCase()}">${r}</span>`;
}

function renderRecruitCard(ref) {
  const recruit = resolveRecruit(ref);

  if (!recruit) {
    const fallbackName = typeof ref === 'object' ? (ref.name || 'Unknown Recruit') : String(ref);
    return `
      <div class="recruit-card">
        <div class="recruit-header">
          <div class="recruit-info">
            <div class="recruit-name"><span>${fallbackName}</span></div>
          </div>
        </div>
      </div>
    `;
  }

  const recruitKey = recruit.id !== null && recruit.id !== undefined ? recruit.id : recruit.name;
  const recruited = isChecked('recruits', recruitKey);
  const imgSrc = getImagePath(recruit.name);
  const idPrefix = (recruit.id !== null && recruit.id !== undefined) ? `#${recruit.id} ` : '';

  return `
    <div class="recruit-card ${recruited ? 'recruited' : ''} ${recruit.range === 'NP' ? 'recruit-support' : ''}" 
         data-track-cat="recruits" 
         data-track-key="${recruitKey}"
         title="Click to toggle recruited status">
      <div class="recruit-header">
        <img src="${imgSrc}" alt="${recruit.name}" class="recruit-img" onerror="this.style.display='none'">
        <div class="recruit-info">
          <div class="recruit-name">
            <span>${idPrefix}${recruit.name}</span>
            ${renderRangeBadge(recruit.range)}
          </div>
        </div>
        <span class="recruit-status-badge">${recruited ? '✔ Recruited' : '◯ Not Recruited'}</span>
      </div>
      <div class="recruit-condition">${recruit.condition ? recruit.condition : ''}</div>
    </div>
  `;
}

function renderRecruitsSection(dataObj) {
  if (!dataObj || !dataObj.recruits || !Array.isArray(dataObj.recruits) || dataObj.recruits.length === 0) {
    return '';
  }

  const cardsHTML = dataObj.recruits.map(ref => renderRecruitCard(ref)).join('');

  return `
    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
      <div style="font-size: 0.8rem; font-weight: bold; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">⭐ Available Recruit(s)</div>
      <div class="recruits-grid">${cardsHTML}</div>
    </div>
  `;
}