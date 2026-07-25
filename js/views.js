function renderChapterView(container, chapterId) {
  const chapter = guideData.chapters.find(c => c.id === chapterId);
  if (!chapter) return;

  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'chapter-header-card';
  const chapterBadgesHTML = renderBadges(chapter);
  const chapterRecruitsHTML = renderRecruitsSection(chapter);
  const bgImageName = chapter.pictures || chapter.picture || chapter.image;

  if (bgImageName) {
    header.style.backgroundImage = `linear-gradient(rgba(15, 15, 22, 0.2), rgba(15, 15, 22, 1)), url('./img/chapters/${bgImageName}')`;
    header.style.backgroundSize = "cover";
    header.style.backgroundPosition = "center";
  }

  const chapters = guideData.chapters || [];
  const currentIndex = chapters.findIndex(ch => String(ch.id) === String(currentChapterId));
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = (currentIndex >= 0 && currentIndex < chapters.length - 1) ? chapters[currentIndex + 1] : null;

  header.innerHTML = `
    <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--accent-gold); letter-spacing: 0.05em; font-weight: bold;">Chapter ${chapter.id}</div>
    <h2 class="chapter-title">${chapter.title}</h2>
    ${chapterBadgesHTML ? `<div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-color);">${chapterBadgesHTML}</div>` : ''}
    ${chapterRecruitsHTML}
  `;
  container.appendChild(header);

  if (chapter.party && Array.isArray(chapter.party) && chapter.party.length > 0) {
    const partyCard = createPartyCard(chapter.party, 'Chapter Starting Party');
    container.appendChild(partyCard);
  }

  if (chapter.collectibles && Array.isArray(chapter.collectibles) && chapter.collectibles.length > 0) {
    const collectiblesWrapper = document.createElement('div');
    collectiblesWrapper.innerHTML = renderChapterCollectibles(chapter.collectibles);
    container.appendChild(collectiblesWrapper.firstElementChild || collectiblesWrapper);
  }

  if (!chapter.paragraphs || chapter.paragraphs.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <h3>No walkthrough content yet</h3>
      <p>Select another chapter or update your data files.</p>
    `;
    container.appendChild(emptyState);
    return;
  }

  chapter.paragraphs.forEach(p => {
    let el = document.createElement('div');

    if (p.type === 'plain') {
      el.className = 'paragraph-block';
      const imageMarkup = p.picture ? `
        <figure class="inline-paragraph-img">
          <img src="img/chapters/${p.picture}" alt="Walkthrough screenshot" loading="lazy" onerror="this.parentNode.style.display='none'"/>
        </figure>
      ` : '';
      const formattedText = enhanceParagraphText(p.text.replace(/\[_(.*?)_\]/g, '<mark class="item-tag">$1</mark>'));
      el.innerHTML = imageMarkup + formattedText;
    } 
    else if (p.type === 'choices') {
      el.className = 'choices-card';
      el.innerHTML = `
        <div class="choices-title">Dialogue</div>
        ${p.items.map(choice => `<div class="choice-item">▸ "${choice}"</div>`).join('')}
      `;
    } 
    else if (p.type === 'note') {
      el.className = 'note-card';
      el.innerHTML = `
        <div class="note-title">💡</div>
        <div>${p.text}</div>
      `;
    } 
    else if (p.type === 'boss') {
      el.className = 'boss-card';
      const bossName = p.name || p.title || p.text || 'BOSS BATTLE';
      const hp = p.hp ? `<span class="boss-stat-badge">HP: ${p.hp}</span>` : '';
      const strategyText = p.strategy || p.text || p.notes || '';
      const formattedStrategy = strategyText ? strategyText.replace(/\[_(.*?)_\]/g, '<mark class="item-tag">$1</mark>') : '';

      let extraFields = '';
      if (p.weakness) extraFields += `<div class="boss-field"><strong>Weakness:</strong> ${p.weakness}</div>`;
      
      const rewards = p.reward || p.rewards;
      if (rewards) {
        const rewardText = Array.isArray(rewards) ? rewards.join(', ') : rewards;
        extraFields += `<div class="boss-field"><strong>🏆 </strong> ${rewardText}</div>`;
      }

      const drops = p.drops || p.drop || p.items;
      if (drops) {
        const dropsList = Array.isArray(drops) ? drops.join(', ') : drops;
        extraFields += `<div class="boss-field"><strong>🎁 </strong> ${dropsList}</div>`;
      }

      el.innerHTML = `
        <div class="boss-header">
          <span class="boss-title">⚔️ ${bossName}</span>
          ${hp}
        </div>
        ${extraFields}
        ${renderBossCard(bossName)}
        ${formattedStrategy ? `<div class="boss-strategy">${formattedStrategy}</div>` : ''}
      `;
    }
    else if (p.type === 'party') {
      const title = p.title || p.text || 'Recommended Party Setup';
      const members = p.members || p.party || p.items || [];
      el = createPartyCard(members, title);
    }
    else if (p.type === 'place') {
      el.className = 'place-card';
      const badgesHTML = renderBadges(p);
      const placeRecruitsHTML = renderRecruitsSection(p);

      let placePartyHTML = '';
      if (p.party && Array.isArray(p.party) && p.party.length > 0) {
        const partyChips = p.party.map(m => renderPartyChip(m)).join('');
        placePartyHTML = `
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
            <div class="party-header" style="font-size: 0.8rem; margin-bottom: 8px;">⚔️ Active / Recommended Party</div>
            <div class="party-grid">${partyChips}</div>
          </div>
        `;
      }

      el.innerHTML = `
        <div class="place-header">📍 ${p.text}</div>
        ${badgesHTML}
        ${placeRecruitsHTML}
        ${placePartyHTML}
      `;
    }
    else if (p.type === 'mb') {
      el.innerHTML = renderMajorBattleCard(p.id);
    }
    else if (p.type === 'duel') {
      el.innerHTML = renderDuelCard(p.id);
    }

    container.appendChild(el);
  });

  const footerNav = document.createElement('footer');
  footerNav.className = 'chapter-nav-footer';
  footerNav.innerHTML = `
    ${prevChapter ? `
      <button class="chapter-nav-btn prev-btn" data-chapter-id="${prevChapter.id}">
        <span class="nav-arrow">←</span>
        <div class="nav-btn-text">
          <small>Previous</small>
          <span>${getChapterLabel(prevChapter)}</span>
        </div>
      </button>
    ` : '<div></div>'}

    ${nextChapter ? `
      <button class="chapter-nav-btn next-btn" data-chapter-id="${nextChapter.id}">
        <div class="nav-btn-text" style="text-align: right;">
          <small>Next</small>
          <span>${getChapterLabel(nextChapter)}</span>
        </div>
        <span class="nav-arrow">→</span>
      </button>
    ` : '<div></div>'}
  `;
  container.appendChild(footerNav);

  footerNav.querySelectorAll('.chapter-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = parseInt(btn.getAttribute('data-chapter-id'), 10);
      if (targetId) {
        currentChapterId = targetId;
        saveCurrentChapter();
        renderSidebar();
        renderCurrentChapter();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }); 
}

function renderRecruitsView(container) {
  if (!guideData.recruits || !guideData.recruits.length) {
    container.innerHTML = `<div class="empty-state"><h3>No recruits found</h3></div>`;
    return;
  }

  const totalRecruits = guideData.recruits.length;
  const recruitedCount = userProgress.recruits ? userProgress.recruits.length : 0;

  container.innerHTML = `
    <div class="chapter-header-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 class="chapter-title" style="margin: 0;">108 Stars of Destiny Index</h2>
        <span class="badge" style="background: var(--accent-gold); color: #000; font-weight: bold; font-size: 0.85rem;">
          ${recruitedCount}/${totalRecruits} Recruited
        </span>
      </div>
      <p style="color: var(--text-muted); margin-top: 6px;">Master list of available character recruits. Click any hero card to toggle recruited status.</p>
    </div>
    <div class="recruits-grid">
      ${guideData.recruits.map(r => renderRecruitCard(r)).join('')}
    </div>
  `;
}

function renderEnemiesView() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const allEnemies = guideData.enemies?.[0] || {};
  const normalEnemies = Object.entries(allEnemies).filter(([_, data]) => {
    const type = String(data.type || '').toLowerCase();
    return type === 'normal' || type === 'boss';
  });

  main.innerHTML = `
    <section class="chapter-header-card">
      <h1 class="chapter-title">👾 Enemy Bestiary</h1>
      <p>Stats, drops, and weaknesses for monsters encountered across the realm (${normalEnemies.length} entries).</p>
    </section>

    <div class="enemies-grid">
      ${normalEnemies.length > 0 
        ? normalEnemies.map(([name, data]) => renderEnemyCard(name, data)).join('')
        : '<p style="padding: 20px; color: var(--text-muted);">No normal enemies found in database.</p>'
      }
    </div>
  `;
  main.scrollTop = 0;
}

function renderHQView() {
  const main = document.getElementById('main-content');
  if (!main) return;

  const hq = guideData.hq;
  if (!hq) {
    main.innerHTML = `<p style="padding: 20px; color: #e74c3c;">Headquarters data not found in guideData!</p>`;
    return;
  }

  const recruitedCount = userProgress.recruits ? userProgress.recruits.length : 0;
  
  let activeStageNumber = 1;
  if (recruitedCount >= 90) activeStageNumber = 4;
  else if (recruitedCount >= 45) activeStageNumber = 3;
  else if (recruitedCount >= 25) activeStageNumber = 2;

  let nextThreshold = 25;
  if (recruitedCount >= 45) nextThreshold = 90;
  else if (recruitedCount >= 25) nextThreshold = 45;

  const starsNeeded = Math.max(0, nextThreshold - recruitedCount);
  const progressPercent = Math.min(100, Math.round((recruitedCount / nextThreshold) * 100));

  const bgPicture = hq.picture ? `./img/hq/${hq.picture}` : '';
  const levels = Array.isArray(hq.levels) ? hq.levels : [];
  const facilities = Array.isArray(hq.facilities) ? hq.facilities : [];

  main.innerHTML = `
    <section class="hq-header-card" ${bgPicture ? `style="background-image: linear-gradient(rgba(15, 15, 22, 0.2), rgba(15, 15, 22, 0.95)), url('${bgPicture}');"` : ''}>
      <div class="hq-header-content">
        <span class="hq-badge">🏰 CASTLE HEADQUARTERS</span>
        <h1 class="hq-title">Headquarters Upgrades & Facilities</h1>
        <p class="hq-subtitle">Track castle growth, level unlock conditions, and available facilities.</p>
      </div>
    </section>

    <section class="hq-banner">
      <div class="hq-banner-info">
        <h2>Toran Castle Status</h2>
        <div class="hq-recruit-counter">
          <span class="count-highlight">${recruitedCount}</span> / 108 Stars Recrypted
        </div>
      </div>

      <div class="hq-progress-box">
        <div class="hq-progress-label">
          <span>Next Castle Level: <strong>${starsNeeded === 0 ? 'MAX REACHED' : `${starsNeeded} stars remaining`}</strong></span>
          <span>${progressPercent}%</span>
        </div>
        <div class="hq-progress-bar-bg">
          <div class="hq-progress-bar-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>
    </section>

    ${levels.length > 0 ? `
      <section class="hq-section">
        <h2 class="hq-section-title">🏰 Castle Expansion Levels</h2>
        <div class="hq-levels-list">
          ${levels.map(lvl => {
            const isUnlocked = recruitedCount >= lvl.unlock;
            const isActive = lvl.id === activeStageNumber;

            let statusClass = "locked";
            let statusText = "Locked";

            if (isActive) {
              statusClass = "current";
              statusText = "Current Level";
            } else if (isUnlocked) {
              statusClass = "unlocked";
              statusText = "Unlocked";
            }

            return `
              <div class="hq-level-card">
                <div class="hq-level-header">
                  <span class="hq-level-badge">Level ${lvl.id}</span>
                  <span class="hq-level-unlock"><strong>Unlock:</strong> ${lvl.unlock || 'Default'}</span>
                  <span class="status-pill ${statusClass}">${statusText}</span>
                </div>
                ${Array.isArray(lvl.upgrades) && lvl.upgrades.length > 0 ? `
                  <div class="hq-upgrades-box">
                    <strong>Upgrades Unlocked:</strong>
                    <div class="hq-upgrade-chips">
                      ${lvl.upgrades.map(u => `<span class="hq-chip">${u}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </section>
    ` : ''}

    ${facilities.length > 0 ? `
      <section class="hq-section" style="margin-top: 32px;">
        <h2 class="hq-section-title">🏪 Castle Facilities</h2>
        <div class="hq-facilities-grid">
          ${facilities.map(fac => {
            const facilityName = fac.Facility || fac.facility || 'Facility';
            const reqLevel = fac["HQ Level"] || fac.hqLevel;
            const rawUnlock = fac["Unlocked By"] || fac.unlockedBy;
            const description = fac.Description || fac.description || '';
            const recruitInfo = getRecruitInfo(rawUnlock);
            const recruitId = Number(fac["Unlocked By"]);
            const isFacilityUnlocked = userProgress.recruits.includes(recruitId);

            return `
              <div class="hq-facility-card">
                <div class="hq-facility-header">
                  <h3 class="facility-name">${facilityName}</h3>
                  ${reqLevel ? `<span class="facility-hq-tag">HQ Lv. ${reqLevel}</span>` : ''}
                  <span class="facility-status-pill ${isFacilityUnlocked ? 'pill-unlocked' : 'pill-locked'}">
                    ${isFacilityUnlocked ? '✓ Unlocked' : `🔒 Needs Recruit #${recruitId}`}
                  </span>
                </div>
                
                <div class="hq-facility-body">
                  <div class="facility-unlocked-by" data-recruit-key="${rawUnlock || ''}">
                    <small>Unlocked By:</small>
                    ${recruitInfo ? `
                      <div class="hq-recruit-unlock">
                        <img 
                          src="${recruitInfo.picture}" 
                          alt="${recruitInfo.name}" 
                          class="hq-recruit-thumb" 
                          onerror="this.style.display='none'"
                        />
                        <span>${recruitInfo.isStar ? '★ ' : ''}${recruitInfo.name}</span>
                      </div>
                    ` : '<span class="hq-raw-unlock">N/A</span>'}
                  </div>
                  ${description ? `<p class="facility-desc">${description}</p>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    ` : ''}
  `;

  initRecruitPopups();
  main.scrollTop = 0;
}

function renderChapterCollectibles(chapterCollectibleIds = []) {
  if (!chapterCollectibleIds.length) return '';

  const checkedIds = getCheckedCollectibles();
  const allCollectibles = guideData.collectibles || [];

  const chapterItems = chapterCollectibleIds
    .map(id => allCollectibles.find(c => c.id === id))
    .filter(Boolean);

  if (!chapterItems.length) return '';

  const chapterIdsAttr = JSON.stringify(chapterCollectibleIds).replace(/"/g, '&quot;');

  return `
    <div class="chapter-collectibles-card">
      <div class="collectibles-card-header">
        <h3>🏆 Collectibles & Key Items</h3>
        <span class="collectibles-count" id="chapter-coll-count">
          ${chapterItems.filter(i => checkedIds.includes(i.id)).length} / ${chapterItems.length} Found
        </span>
      </div>

      <ul class="chapter-collectibles-list">
        ${chapterItems.map(item => {
          const isCheckedItem = checkedIds.includes(item.id);
          const domId = sanitizeId(item.id);
          const detailText = item.desc || item.get || '';

          return `
            <li class="chapter-collectible-item ${isCheckedItem ? 'completed' : ''}" id="chapter-item-${domId}">
              <input 
                type="checkbox" 
                id="chk_${domId}" 
                ${isCheckedItem ? 'checked' : ''}
                onchange="toggleChapterCollectible('${item.id.replace(/'/g, "\\'")}', '${chapterIdsAttr}')"
              />
              
              <label for="chk_${domId}">
                ${item.category ? `<span class="collectible-tag">${item.category}</span>` : ''}
                <strong>${item.id}</strong>
                ${detailText ? `<small>📍 ${detailText}</small>` : ''}
              </label>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
}

function renderAllCollectiblesView(containerId = 'main-content') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const allItems = guideData.collectibles || [];
  const checkedIds = getCheckedCollectibles();
  const categories = ['All', ...new Set(allItems.map(item => item.category || 'Uncategorized'))];

  container.innerHTML = `
    <div class="master-collectibles-view">
      <header class="master-collectibles-header">
        <h1>🏆 Master Collectibles & Items Index</h1>
        <p>Track all key items, rare equipment, and HQ collectibles across Suikoden.</p>
        
        <div class="master-progress-container">
          <div class="master-progress-bar">
            <div id="master-progress-fill" class="master-progress-fill" style="width: 0%;"></div>
          </div>
          <span id="master-progress-text" class="master-progress-text">0 / ${allItems.length} Found (0%)</span>
        </div>
      </header>

      <div class="collectibles-controls">
        <div class="search-box">
          <input 
            type="text" 
            id="coll-search-input" 
            placeholder="Search items, locations..." 
            oninput="filterMasterCollectibles()"
          />
        </div>

        <div class="filter-group">
          <label for="coll-category-select">Category:</label>
          <select id="coll-category-select" onchange="filterMasterCollectibles()">
            ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>

          <label class="toggle-completed-label">
            <input type="checkbox" id="coll-hide-completed" onchange="filterMasterCollectibles()" />
            Hide Completed
          </label>
        </div>
      </div>

      <div id="master-collectibles-grid" class="master-collectibles-grid">
        ${renderCategoryGroups(allItems, checkedIds)}
      </div>
    </div>
  `;

  updateAllCollectiblesProgress();
  container.scrollTop = 0;
}

function renderCategoryGroups(items, checkedIds) {
  if (!items.length) {
    return `<div class="empty-results">No collectibles match your search filter.</div>`;
  }

  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return Object.keys(grouped).map(catName => {
    const catItems = grouped[catName];

    return `
      <section class="master-category-card" data-category="${catName}">
        <div class="category-card-header">
          <h2>
            <span class="collectible-tag">${catName}</span>
          </h2>
          <span class="category-count">
            ${catItems.filter(i => checkedIds.includes(i.id)).length} / ${catItems.length}
          </span>
        </div>

        <ul class="master-items-list">
          ${catItems.map(item => {
            const isCheckedItem = checkedIds.includes(item.id);
            const domId = sanitizeId(item.id);
            const detailText = item.desc || '';
            const detailGet = item.get || '';

            return `
              <li 
                class="master-item-row ${isCheckedItem ? 'completed' : ''}" 
                id="master-row-${domId}"
                data-name="${item.id.toLowerCase()}"
                data-desc="${detailText.toLowerCase()}"
                data-get="${detailGet}"
                data-status="${isCheckedItem ? 'completed' : 'pending'}"
              >
                <input 
                  type="checkbox" 
                  id="master_chk_${domId}" 
                  ${isCheckedItem ? 'checked' : ''}
                  onchange="toggleMasterCollectible('${item.id.replace(/'/g, "\\'")}')"
                />
                <label for="master_chk_${domId}">
                  <strong>${item.id}</strong>
                  ${detailText ? `<small>${detailText}</small>` : ''}
                  ${detailGet ? `<small>${detailGet}</small>` : ''}
                </label>
              </li>
            `;
          }).join('')}
        </ul>
      </section>
    `;
  }).join('');
}

function updateAllCollectiblesProgress() {
  const allItems = guideData.collectibles || [];
  if (!allItems.length) return;

  const saved = getCheckedCollectibles();
  const total = allItems.length;
  const count = saved.length;
  const pct = Math.round((count / total) * 100) || 0;

  const bar = document.getElementById('master-progress-fill');
  const text = document.getElementById('master-progress-text');

  if (bar) bar.style.width = `${pct}%`;
  if (text) text.innerText = `${count} / ${total} Found (${pct}%)`;
}

function filterMasterCollectibles() {
  const query = (document.getElementById('coll-search-input')?.value || '').toLowerCase();
  const selectedCategory = document.getElementById('coll-category-select')?.value || 'All';
  const hideCompleted = document.getElementById('coll-hide-completed')?.checked || false;

  const categoryCards = document.querySelectorAll('.master-category-card');

  categoryCards.forEach(card => {
    const cardCategory = card.dataset.category;
    const categoryMatches = selectedCategory === 'All' || cardCategory === selectedCategory;

    let visibleItemCount = 0;
    const itemRows = card.querySelectorAll('.master-item-row');

    itemRows.forEach(row => {
      const name = row.dataset.name || '';
      const desc = row.dataset.desc || '';
      const isCompleted = row.dataset.status === 'completed';

      const searchMatches = name.includes(query) || desc.includes(query);
      const completionMatches = !hideCompleted || !isCompleted;

      if (categoryMatches && searchMatches && completionMatches) {
        row.style.display = 'flex';
        visibleItemCount++;
      } else {
        row.style.display = 'none';
      }
    });

    card.style.display = (categoryMatches && visibleItemCount > 0) ? 'block' : 'none';
  });
}

function renderUnitesView(containerId = 'main-content') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const unites = guideData?.unites || [];
  const recruits = guideData?.recruits || [];

  const groupedUnites = unites.reduce((acc, unite) => {
    const participants = String(unite.stars || '')
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

    const count = participants.length;
    if (count === 0) return acc;

    if (!acc[count]) acc[count] = [];
    acc[count].push({ ...unite, participants });
    return acc;
  }, {});

  const sortedCounts = Object.keys(groupedUnites).sort((a, b) => Number(a) - Number(b));

  container.innerHTML = `
    <div class="unites-view">
      <header class="unites-header">
        <h1>⚔️ Unite Attacks Database</h1>
        <p>Discover powerful combo attacks and the recruits required to perform them.</p>
      </header>

      ${sortedCounts.map(count => `
        <section class="unites-group">
          <h2 class="unites-group-title">
            <span class="star-badge">${'★'.repeat(Number(count))}</span> ${count}-Person Unites
          </h2>
          
          <div class="unites-grid">
            ${groupedUnites[count].map(unite => renderUniteCard(unite, recruits)).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;
  container.scrollTop = 0;
}

function renderCity(cityKey, cityData) {
  if (!cityData) return `<div class="empty-state"><h3>City data not found</h3></div>`;

  const recruits = guideData?.recruits || [];
  const participants = String(cityData.stars || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);

  let shopsHtml = '';
  if (cityData.shops && cityData.shops.length > 0) {
    const shopListHtml = cityData.shops.map(shop => {
      let sections = [];
      if (shop.items && shop.items.length > 0) {
        sections.push(renderShopCategory('🎒 Item Shop', shop.items));
      }
      if (shop.armor && shop.armor.length > 0) {
        sections.push(renderShopCategory('🛡️ Armor Shop', shop.armor));
      }
      return sections.join('');
    }).join('');

    shopsHtml = `<div class="rpg-shops-grid">${shopListHtml}</div>`;
  }

  return `
    <div class="rpg-box rpg-city-card" id="city-${cityKey}">
      <div class="rpg-city-header">
        <div class="rpg-city-title-group">
          <h2 class="rpg-city-title">🏰 ${escapeHtml(cityData.name)}</h2>
        </div>
        ${cityData.inn !== undefined ? `<div class="rpg-city-inn">🛌 Inn: ${cityData.inn} Bits per person.</div>` : ''}
      </div>

      ${cityData.picture ? `<img src="./img/cities/${escapeHtml(cityData.picture)}" class="rpg-city-img" alt="${escapeHtml(cityData.name)}">` : ''}

      ${participants.length > 0 ? `
        <div class="rpg-section-label">✨ Recruitable Stars</div>
        <div class="rpg-stars-section">
          ${participants.map(id => {
            const recruit = recruits.find(r => String(r.id) === String(id));
            return renderRecruitCard(recruit || id);
          }).join('')}
        </div>
      ` : ''}

      ${shopsHtml}
    </div>
  `;
}