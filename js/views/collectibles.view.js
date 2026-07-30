function renderChapterCollectibles(chapterCollectibleIds = []) {
  if (!chapterCollectibleIds.length) return '';
const trackables = document.getElementById('trackables');
  trackables.innerHTML = '';
  const checkedIds = getCheckedCollectibles();
  const allCollectibles = guideData.collectibles || [];

  const chapterItems = chapterCollectibleIds
    .map(id => allCollectibles.find(c => c.id === id))
    .filter(Boolean);

  if (!chapterItems.length) return '';

  const chapterIdsAttr = JSON.stringify(chapterCollectibleIds).replace(/"/g, '&quot;');
/*
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
  */
 return `
 <div class="chapter-collectibles-card">
      <div class="collectibles-card-header">
        <h3>🏆 Collectibles & Key Items</h3>
        <span class="collectibles-count" id="chapter-coll-count">
          ${chapterItems.filter(i => checkedIds.includes(i.id)).length} / ${chapterItems.length} Found
        </span>
      </div>
      <div>
${chapterItems.map(item => {
          const isCheckedItem = checkedIds.includes(item.id);
          const domId = sanitizeId(item.id);
          const detailText = item.desc || item.get || '';
        
          return `
            <span class="chapter-collectible-item ${isCheckedItem ? 'completed' : ''}" id="chapter-item-${domId}">
              <input 
                type="checkbox" 
                id="chk_${domId}" 
                ${isCheckedItem ? 'checked' : ''}
                onchange="toggleChapterCollectible('${item.id.replace(/'/g, "\\'")}', '${chapterIdsAttr}')"
              />
              
              <label for="chk_${domId}">
                ${item.category ? `<span class="collectible-tag">${item.category}</span>` : ''}
                <strong>${item.id}</strong>
                
              </label>
              ${detailText ? `<small>📍 ${detailText}</small>` : ''}
            </span>
          `;
        }).join('')}
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