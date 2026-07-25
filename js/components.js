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

function renderBossCard(bossName) {
  const bossData = (guideData.enemies?.[0] && guideData.enemies[0][bossName]) || {};
  const name = bossName || 'Unknown Boss';
  const imgPath = `./img/bosses/${name.toLowerCase()}.gif`;

  const statsList = [
    { key: 'level', label: 'LEVEL', val: bossData.Level },
    { key: 'hp', label: 'HP', val: bossData.HP },
    { key: 'power', label: 'POWER', val: bossData.power },
    { key: 'defense', label: 'DEFENSE', val: bossData.defense },
    { key: 'speed', label: 'SPEED', val: bossData.speed },
    { key: 'magic', label: 'MAGIC', val: bossData.magic },
    { key: 'skill', label: 'SKILL', val: bossData.skill },
    { key: 'luck', label: 'LUCK', val: bossData.luck }
  ].filter(s => s.val !== undefined && s.val !== null);

  let weaknesses = [];
  if (Array.isArray(bossData.weaknesses) && bossData.weaknesses.length > 0) {
    const rawWeaknesses = bossData.weaknesses[0];
    Object.entries(rawWeaknesses).forEach(([elem, value]) => {
      weaknesses.push({ element: elem, affinity: value });
    });
  }

  let drops = [];
  if (Array.isArray(bossData.drop)) {
    drops = bossData.drop.map(item => ({
      name: item.name,
      rarity: String(item.Rarity || '').replace(/%%/g, '%')
    }));
  }

  return `
    <div class="boss-body">
      <div class="boss-portrait-container">
        <img src="${imgPath}" alt="${name}" class="boss-sprite" onerror="this.parentElement.style.display='none'"/>
      </div>
      <div class="boss-stats-grid">
        ${statsList.map(s => `
          <div class="stat-item ${s.key === 'level' ? 'stat-level' : ''}">
            <span class="stat-label">${s.label}</span>
            <span class="stat-value">${s.val}</span>
          </div>
        `).join('')}
      </div>
    </div>

    ${weaknesses.length > 0 ? `
      <div class="boss-affinities">
        <span class="affinity-title">Affinities:</span>
        <div class="affinity-chips">
          ${weaknesses.map(w => `
            <span class="affinity-chip affinity-${w.affinity.toLowerCase()}">
              ${w.element} <strong>${w.affinity}</strong>
            </span>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${drops.length > 0 ? `
      <div class="boss-drops">
        <span class="drop-title">🎁 </span>
        ${drops.map(d => `
          <span class="drop-chip">
            ${d.name} <small>(${d.rarity})</small>
          </span>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function renderEnemyCard(name, enemyData) {
  const isBoss = String(enemyData.type || '').toLowerCase() === 'boss';
  const imgFolder = isBoss ? 'bosses' : 'enemies';
  const imgPath = isBoss ? `./img/${imgFolder}/${name.toLowerCase()}.gif` : `./img/${imgFolder}/${enemyData.picture}`;

  const cardClass = isBoss ? 'boss-card' : 'boss-card enemy-card-style';
  const badgeText = isBoss ? '⚔️ BOSS' : '👾 ENEMY';
  const badgeClass = isBoss ? 'boss-badge' : 'boss-badge enemy-badge';
  const levelClass = isBoss ? 'stat-item stat-level' : 'stat-item stat-level enemy-level';

  const statsList = [
    { key: 'level', label: 'LEVEL', val: enemyData.Level },
    { key: 'hp', label: 'HP', val: enemyData.HP },
    { key: 'power', label: 'POWER', val: enemyData.power },
    { key: 'defense', label: 'DEFENSE', val: enemyData.defense },
    { key: 'speed', label: 'SPEED', val: enemyData.speed },
    { key: 'magic', label: 'MAGIC', val: enemyData.magic },
    { key: 'skill', label: 'SKILL', val: enemyData.skill },
    { key: 'luck', label: 'LUCK', val: enemyData.luck }
  ].filter(s => s.val !== undefined && s.val !== null);

  let weaknesses = [];
  if (Array.isArray(enemyData.weaknesses) && enemyData.weaknesses.length > 0) {
    const rawWeaknesses = enemyData.weaknesses[0];
    Object.entries(rawWeaknesses).forEach(([elem, value]) => {
      weaknesses.push({ element: elem, affinity: value });
    });
  }

  let drops = [];
  if (Array.isArray(enemyData.drop)) {
    drops = enemyData.drop.map(item => ({
      name: item.name,
      rarity: String(item.Rarity || '').replace(/%%/g, '%')
    }));
  }

  return `
    <div class="${cardClass}">
      <div class="boss-header">
        <span class="${badgeClass}">${badgeText}</span>
        <h3 class="boss-name">${name}</h3>
      </div>

      <div class="boss-body">
        <div class="boss-portrait-container">
          <img src="${imgPath}" alt="${name}" class="boss-sprite" onerror="this.parentElement.style.display='none'"/>
        </div>

        <div class="boss-stats-grid">
          ${statsList.map(s => `
            <div class="${s.key === 'level' ? levelClass : 'stat-item'}">
              <span class="stat-label">${s.label}</span>
              <span class="stat-value">${s.val}</span>
            </div>
          `).join('')}
        </div>
      </div>

      ${weaknesses.length > 0 ? `
        <div class="boss-affinities">
          <span class="affinity-title">Affinities:</span>
          <div class="affinity-chips">
            ${weaknesses.map(w => `
              <span class="affinity-chip affinity-${w.affinity.toLowerCase()}">
                ${w.element} <strong>${w.affinity}</strong>
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${enemyData.bits ? `
        <div class="boss-drops">
          <span class="drop-title">💰 Bits:</span>
          <span class="drop-chip">${enemyData.bits}</span>
        </div>
      ` : ''}

      ${drops.length > 0 ? `
        <div class="boss-drops">
          <span class="drop-title">🎁 Drops:</span>
          ${drops.map(d => `
            <span class="drop-chip">
              ${d.name} <small>(${d.rarity})</small>
            </span>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
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

function renderUniteCard(unite, allRecruits) {
  return `
    <div class="unite-card">
      <div class="unite-card-header">
        <h3>${unite.name}</h3>
      </div>

      <div class="unite-characters">
        ${unite.participants.map(id => {
          const recruit = allRecruits.find(r => String(r.id) === String(id));

          if (!recruit) {
            return `
              <div class="unite-char-container">
                <div class="unite-char-avatar missing">?</div>
                <span class="unite-char-name">ID #${id}</span>
              </div>
            `;
          }

          return `
            <div class="unite-char-container">
              <div class="unite-char-avatar">
                <img 
                  src="./img/stars/${recruit.name.replace(/\s/g, '')}.png" 
                  alt="${recruit.name}" 
                  onerror="this.src='img/placeholder.png'" 
                />
              </div>
              <span class="unite-char-name">${recruit.name}</span>
              
              <div class="recruit-tooltip">
                <strong>${recruit.name}</strong>
                <ul>
                  ${recruit.range ? `<li>🎯 Range: <span>${recruit.range}</span></li>` : ''}
                  ${recruit.condition ? `<li>🤝 <span>${recruit.condition}</span></li>` : ''}
                </ul>
              </div>
            </div>
          `;
        }).join('<span class="unite-plus">+</span>')}
      </div>

      <div class="unite-effect">
        <strong>Effect:</strong> ${unite.effect}
      </div>
    </div>
  `;
}

function renderShopCategory(title, itemList) {
  const rows = itemList.map(item => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td class="rpg-shop-price">${item.price.toLocaleString()} Bits</td>
    </tr>
  `).join('');

  return `
    <div class="rpg-shop-box">
      <div class="rpg-section-label">${title}</div>
      <table class="rpg-shop-table">
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}