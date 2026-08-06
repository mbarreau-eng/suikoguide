function renderBossCard(bossName) {
  const bossData = (guideData.enemies?.[0] && guideData.enemies[0][bossName]) || {};
  const name = bossName || 'Unknown Boss';
  const imgPath = `./img/bosses/${bossData.picture}`;

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
  const imgPath =  `./img/${imgFolder}/${enemyData.picture}`;



  const cardClass = isBoss ? 'boss-card' : 'boss-card enemy-card-style';
  const badgeText = isBoss ? 'BOSS' : 'ENEMY';
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
        

        <div class="boss-stats-grid">
        <div class="boss-portrait-container">
          <img src="${imgPath}" alt="${name}" class="boss-sprite" onerror="this.parentElement.style.display='none'"/>
        </div>
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
                <img src="./img/assets/${w.element}.gif" alt="${w.element}" />
                <strong>&nbsp;${w.affinity}</strong>
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