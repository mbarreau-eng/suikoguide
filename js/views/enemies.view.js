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