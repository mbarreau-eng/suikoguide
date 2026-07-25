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