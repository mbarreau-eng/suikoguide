// Helper to render distinct range badges
function renderRangeBadge(range) {
  if (!range) return '';

  const r = String(range).trim().toUpperCase();

  if (r === 'NP') {
    return `<span class="range-badge range-np" title="Non-Playable / Support Staff">NP (Support)</span>`;
  }

  // Standard combat ranges (S, M, L)
  return `<span class="range-badge range-${r.toLowerCase()}">${r}</span>`;
}

// Helper: Generates HTML for a single Recruit Card (Interactive for recruiting)
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
    <div class="recruit-card ${recruited ? 'recruited' : ''}" 
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
    </div>
  `;
}

// Helper: Renders inline badges with interactive checkbox progress tracking
function renderBadges(dataObj) {
  if (!dataObj) return '';

  const categories = [
    { key: 'savepoints', label: 'Save Points', trackable: false },
    { key: 'places', label: 'Locations', trackable: false },
    { key: 'enemies', label: 'Enemies', trackable: false },
    { key: 'items', label: 'Items', trackable: true },
    { key: 'equipment', label: 'Equipment', trackable: true },
    { key: 'runes', label: 'Runes', trackable: true },
    { key: 'bits', label: 'Bits', trackable: true }
  ];

  let html = '';
  categories.forEach(cat => {
    const val = dataObj[cat.key];
    if (val && Array.isArray(val) && val.length > 0) {
      const badges = val.map(x => {
        const isObj = typeof x === 'object' && x !== null;
        const label = isObj ? (x.name || x.title || JSON.stringify(x)) : x;
        const typeStr = isObj && typeof x.type === 'string' ? x.type.toLowerCase() : '';
        const isBoss = isObj && (typeStr === 'boss' || x.isBoss === true);

        // Check trackable state
        const checked = cat.trackable ? isChecked(cat.key, label) : false;

        let badgeClass = 'badge';
        if (isBoss) badgeClass += ' badge-boss';
        if (cat.trackable) badgeClass += ' badge-trackable';
        if (checked) badgeClass += ' checked';

        const icon = isBoss ? '💀 ' : (checked ? '✔ ' : '');
        const trackAttrs = cat.trackable ? `data-track-cat="${cat.key}" data-track-key="${label}" title="Click to check off"` : '';

        return `<span class="${badgeClass}" ${trackAttrs}>${icon}${label}</span>`;
      }).join('');

      html += `<div class="badge-group"><span class="badge-label">${cat.label}:</span> ${badges}</div>`;
    }
  });

  return html;
}

// Helper: Generates HTML for a single party member chip with an avatar
function renderPartyChip(m) {
  const name = typeof m === 'object' ? (m.name || m.character) : m;
  const level = typeof m === 'object' && m.level ? `Lv. ${m.level}` : '';
  const imgSrc = getImagePath(name);

  return `
    <div class="party-member-chip">
      <img src="${imgSrc}" alt="${name}" class="member-img" onerror="this.style.display='none'">
      <div class="member-details">
        <span class="member-name">${name}</span>
        ${level ? `<span class="member-level">${level}</span>` : ''}
      </div>
    </div>
  `;
}

// Helper: Builds full party card elements
function createPartyCard(members, title = 'Current Party') {
  const el = document.createElement('div');
  el.className = 'party-card';
  
  const membersHTML = members.map(m => renderPartyChip(m)).join('');

  el.innerHTML = `
    <div class="party-header">⚔️ ${title}</div>
    <div class="party-grid">${membersHTML}</div>
  `;
  return el;
}

// Helper: Formats image path into ./img/stars/ with NO spaces
function getImagePath(name) {
  if (!name) return '';
  const fileName = name.toLowerCase().replace(/\s+/g, '');
  return `./img/stars/${fileName}.png`;
}

// Helper: Resolves a recruit reference (ID, ID object, or full object) to guideData.recruits
function resolveRecruit(ref) {
  if (!guideData || !guideData.recruits) return null;

  let recruitId = null;
  let customOverrides = null;

  if (typeof ref === 'number' || (typeof ref === 'string' && !isNaN(Number(ref)))) {
    recruitId = Number(ref);
  } else if (ref && typeof ref === 'object') {
    if (ref.id !== undefined && ref.id !== null) {
      recruitId = Number(ref.id);
      customOverrides = ref;
    } else {
      return ref; // Object without ID, treat as direct recruit object
    }
  }

  if (recruitId !== null) {
    const found = guideData.recruits.find(r => r.id === recruitId);
    if (found) {
      return customOverrides ? { ...found, ...customOverrides } : found;
    }
  }

  return null;
}



// Helper: Builds a recruits section grid for chapters or place blocks
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

// Generates image path from boss name (e.g. "Zombie Dragon" -> "./img/bosses/zombie dragon.gif" or "zombie_dragon.gif")
function getBossImagePath(bossName) {
  if (!bossName) return '';
  const cleanName = String(bossName).trim().toLowerCase();
  return `./img/bosses/${cleanName}.gif`;
}

// Formats object keys into user-friendly labels (e.g., "item_drop" -> "Item Drop", "hp" -> "HP")
function formatStatLabel(key) {
  const customLabels = {
    hp: 'HP',
    exp: 'EXP',
    mp: 'MP',
    potch: 'Potch',
    bits: 'Potch'
  };

  if (customLabels[key.toLowerCase()]) {
    return customLabels[key.toLowerCase()];
  }

  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}