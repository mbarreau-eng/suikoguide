function renderUnitesView(containerId = "main-content") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const unites = guideData?.unites || [];
  const recruits = guideData?.recruits || [];

  const groupedUnites = unites.reduce((acc, unite) => {
    const participants = String(unite.stars || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const count = participants.length;
    if (count === 0) return acc;

    if (!acc[count]) acc[count] = [];
    acc[count].push({ ...unite, participants });
    return acc;
  }, {});

  const sortedCounts = Object.keys(groupedUnites).sort(
    (a, b) => Number(a) - Number(b),
  );

  container.innerHTML = `
    <div class="chapter-header-card">
      <header class="unites-header">
        <h2 class="chapter-title">Unite Attacks</h2>
        <p style="color: var(--text-muted); margin-top: 6px;">Discover powerful combo attacks and the recruits required to perform them.</p>
      </header>
    </div>
    <div>
      ${sortedCounts
        .map(
          (count) => `
        <section class="unites-group">
          <h2 class="unites-group-title">
            <span class="star-badge">${"★".repeat(Number(count))}</span> ${count}-Person Unites
          </h2>
          
          <div class="unites-grid">
            ${groupedUnites[count].map((unite) => renderUniteCard(unite, recruits)).join("")}
          </div>
        </section>
      `,
        )
        .join("")}
    </div>
  `;
  container.scrollTop = 0;
}
