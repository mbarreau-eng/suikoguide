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
         ${cityData.picture ? `<img src="./img/cities/${escapeHtml(cityData.picture)}" class="rpg-city-img" alt="${escapeHtml(cityData.name)}">` : ''}
          <h2 class="rpg-city-title">${escapeHtml(cityData.name)}</h2>
        </div>
        ${cityData.inn !== undefined ? `<div class="rpg-city-inn">🛌 Inn: ${cityData.inn} Bits per person.</div>` : ''}
      </div>

     

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