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
  const imgSrcO = getImagePath(recruit.name, 'original');
  const imgSrcR = getImagePath(recruit.name, 'remaster');
  const idPrefix = (recruit.id !== null && recruit.id !== undefined) ? `#${recruit.id} ` : '';

  return `
    <div class="recruit-card ${recruited ? 'recruited' : ''} ${recruit.range === 'NP' ? 'recruit-support' : ''}" 
         data-track-cat="recruits" 
         data-track-key="${recruitKey}"
         title="Click to toggle recruited status">
      <div class="recruit-header">
        <img src="${imgSrcO}" alt="${recruit.name}" class="recruit-img original" onerror="this.style.display='none'">
        <img src="${imgSrcR}" alt="${recruit.name}" class="recruit-img remaster" onerror="this.style.display='none'">
        <div class="recruit-info">
          <div class="recruit-name">
            <span>${idPrefix}${recruit.name}</span>
            ${renderRangeBadge(recruit.range)}
          </div>
          <div class="recruit-condition">${recruit.condition ? recruit.condition : ''}</div>
        </div>
        <span class="recruit-status-badge">${recruited ? '✔ Recruited' : '◯ Not Recruited'}</span>
      </div>
      
    </div>
  `;
}

function renderRecruitsSection(dataObj) {
  if (!dataObj || !dataObj.recruits || !Array.isArray(dataObj.recruits) || dataObj.recruits.length === 0) {
    return '';
  }

  const cardsHTML = dataObj.recruits.map(ref => renderRecruitCard(ref)).join('');

  return `
    <div  class="chapter-collectibles-card">
      <div class="collectibles-card-header"><h3>⭐ Available Recruit(s)</h3></div>
      <div class="recruits-grid">${cardsHTML}</div>
    </div>
  `;
}