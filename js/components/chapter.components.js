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
        const checked = cat.trackable ? isChecked(cat.key, label) : false;

        let badgeClass = 'badge';
        if (isBoss) badgeClass += ' badge-boss';
        if (cat.trackable) badgeClass += ' badge-trackable';
        if (checked) badgeClass += ' checked';
        if (cat.key === 'enemies') badgeClass += ' enemy-chip ';

        const icon = isBoss ? '💀 ' : (checked ? '✔ ' : '');
        const trackAttrs = cat.trackable ? `data-track-cat="${cat.key}" data-track-key="${label}" title="Click to check off"` : '';

        return `<span data-enemy-name="${cat.key === 'enemies' ? label : ''}" class="${badgeClass}" ${trackAttrs}>${icon}${label}</span>`;
      }).join('');

      html += `<div class="badge-group"><span class="badge-label">${cat.label}:</span> ${badges}</div>`;
    }
  });

  return html;
}

function renderPartyChip(m) {
  const name = typeof m === 'object' ? (m.name || m.character) : m;
  const level = typeof m === 'object' && m.level ? `Level ${m.level}` : '';
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

function renderMajorBattleCard(mbId) {
  if (!mbId && mbId !== 0) return '';

  const majorList = guideData.major || [];
  const battle = majorList.find(b => String(b.id) === String(mbId));

  if (!battle) return '';

  const title = battle.title || 'Major Battle';
  const countUs = battle.countUs !== undefined ? battle.countUs.toLocaleString() : '???';
  const countThem = battle.countThem !== undefined ? battle.countThem.toLocaleString() : '???';
  const strategyItems = Array.isArray(battle.strategy) ? battle.strategy : [battle.strategy].filter(Boolean);

  let img = battle.picture ? `./img/major/${battle.picture}` : '';
  let bgStyle = img ? `background-image: linear-gradient(rgba(15, 15, 22, 0.2), rgb(15, 15, 22)), url('${img}'); background-size: cover; background-position: center center;` : '';

  let introLines = [];
  if (Array.isArray(battle.intro)) {
    battle.intro.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([speaker, line]) => {
          if (line && String(line).trim()) introLines.push({ speaker, line: String(line).trim() });
        });
      }
    });
  }

  let outroLines = [];
  if (Array.isArray(battle.outro)) {
    battle.outro.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([speaker, line]) => {
          if (line && String(line).trim()) outroLines.push({ speaker, line: String(line).trim() });
        });
      }
    });
  }

  return `
    <div class="major-battle-card" style="${bgStyle}">
      <div class="mb-header">
        <span class="mb-badge">⚔️ MAJOR BATTLE</span>
        <h3 class="mb-title">${title}</h3>
      </div>

      <div class="mb-forces">
        <div class="force-item force-them">
          <span class="force-label">Imperial Army</span>
          <span class="force-count">⚔️ ${countThem}</span>
        </div>
        <div class="force-vs">VS</div>
        <div class="force-item force-us">
          <span class="force-label">Liberation Army</span>
          <span class="force-count">🛡️ ${countUs}</span>
        </div>
      </div>

      ${introLines.length > 0 ? `
        <div class="mb-intro-box">
          <h4 class="mb-intro-title">💬 Intro</h4>
          <div class="mb-dialogue-list">
            ${introLines.map(d => `
              <div class="mb-dialogue-line">
                <strong class="mb-speaker">${d.speaker}:</strong>
                <span class="mb-quote">"${d.line}"</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="mb-strategy-box">
        <div class="mb-strategy-paragraphs">
          <p><strong>Charge vs. Bow</strong> : Both sides take losses, Bow more so.</p>
          <p><strong>Bow vs. Magic</strong> : Magic suffers losses, loses its turn.</p>
          <p><strong>Magic vs. Charge</strong> : Charge suffers heavy losses, loses its turn.</p>
          <p><strong>Same vs. Same</strong> : Both sides suffer losses.</p>
        </div>
      </div>
      <br />

      ${strategyItems.length > 0 ? `
        <div class="mb-strategy-box">
          <h4 class="mb-strategy-title">📜 Battle Strategy</h4>
          <div class="mb-strategy-paragraphs">
            ${strategyItems.map(p => `<p>${p}</p>`).join('')}
          </div>
        </div><br />
      ` : ''}

      ${outroLines.length > 0 ? `
        <div class="mb-intro-box">
          <h4 class="mb-intro-title">💬 Battle conclusion</h4>
          <div class="mb-dialogue-list">
            ${outroLines.map(d => `
              <div class="mb-dialogue-line">
                <strong class="mb-speaker">${d.speaker}:</strong>
                <span class="mb-quote">"${d.line}"</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderDuelCard(duelId) {
  if (!duelId && duelId !== 0) return '';

  const duelsList = guideData.duel || guideData.duels || [];
  const duel = duelsList.find(d => String(d.id) === String(duelId));

  if (!duel) return '';

  const me = duel.me || 'Hero';
  const opp = duel.opp || 'Opponent';

  const cleanQuotes = (arr) => Array.isArray(arr) ? arr.map(q => q.trim()).filter(Boolean) : [];
  const superQuotes = cleanQuotes(duel.super);
  const normalQuotes = cleanQuotes(duel.normal);
  const defendQuotes = cleanQuotes(duel.defend);

  let img = duel.picture ? `./img/duels/${duel.picture}` : '';
  let bgStyle = img ? `background-image: linear-gradient(rgba(15, 15, 22, 0.2), rgb(15, 15, 22)), url('${img}'); background-size: cover; background-position: center center;` : '';

  return `
    <div class="duel-card" style="${bgStyle}">
      <div class="duel-header">
        <span class="duel-badge">🗡️ DUEL</span>
        <h3 class="duel-title">${me} vs. ${opp}</h3>
      </div>

      <div class="duel-dialogue-grid">
        ${defendQuotes.length > 0 ? `
          <div class="duel-move-block move-super">
            <div class="move-header">
              <span class="move-icon">🔥</span>
              <div>
                <strong>${opp} uses Wild Attack when he says:</strong>
                <small class="counter-tip">Counter: 🛡️ DEFEND</small>
              </div>
            </div>
            <ul class="dialogue-list">
              ${defendQuotes.map(q => `<li>"${q}"</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${superQuotes.length > 0 ? `
          <div class="duel-move-block move-normal">
            <div class="move-header">
              <span class="move-icon">⚔️</span>
              <div>
                <strong>${opp} uses Attack when he says:</strong>
                <small class="counter-tip">Counter: 🔥 WILD ATTACK</small>
              </div>
            </div>
            <ul class="dialogue-list">
              ${superQuotes.map(q => `<li>"${q}"</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${normalQuotes.length > 0 ? `
          <div class="duel-move-block move-defend">
            <div class="move-header">
              <span class="move-icon">🛡️</span>
              <div>
                <strong>${opp} Defends when he says:</strong>
                <small class="counter-tip">Counter: ⚔️ ATTACK</small>
              </div>
            </div>
            <ul class="dialogue-list">
              ${normalQuotes.map(q => `<li>"${q}"</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}