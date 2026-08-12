function renderShopCategory(title, itemList) {
  const rows = itemList.map(item => `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      ${item.name == "Inn" ? `<td class="rpg-shop-price">${item.price.toLocaleString()} Bits per person</td>` : ''}
      ${item.name == "Blacksmith" ? `<td class="rpg-shop-price">Up to level ${item.price.toLocaleString()}</td>` : ''}
      ${item.name == "Rune Shop" ? `<td class="rpg-shop-price"></td>` : ''}
      ${item.name != "Blacksmith" && item.name != "Inn" && item.name != "Rune Shop" ? `<td class="rpg-shop-price">${item.price.toLocaleString()} Bits</td>` : ''}
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

function renderMapArea(city, index) {
  if(city.coords) {
    return `
      <area data="${index}" shape="circle" coords="${city.coords},12" alt="${city.name}" onclick="${city.render == 'hq' ? `renderHQView('city-info')` : `displayCity(${index})`}" href="#">
    `;
  }
}