function renderChapterView(container, chapterId) {
  const chapter = guideData.chapters.find(c => c.id === chapterId);
  if (!chapter) return;

  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'chapter-header-card';
  const chapterBadgesHTML = renderBadges(chapter);
  const chapterRecruitsHTML = renderRecruitsSection(chapter);
  const divTrackables = document.getElementById("trackables");
  divTrackables.innerHTML = "";
  

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
    <!--${chapterRecruitsHTML}-->
  `;
  container.appendChild(header);

  if (chapter.party && Array.isArray(chapter.party) && chapter.party.length > 0) {
    const partyCard = createPartyCard(chapter.party, 'Chapter Starting Party');
    container.appendChild(partyCard);
  }

  const collectiblesWrapper = document.createElement('div');

  if (chapter.collectibles && Array.isArray(chapter.collectibles) && chapter.collectibles.length > 0) {
    
    collectiblesWrapper.innerHTML = renderChapterCollectibles(chapter.collectibles);
    //container.appendChild(collectiblesWrapper.firstElementChild || collectiblesWrapper);
  }

  divTrackables.innerHTML = collectiblesWrapper.innerHTML + chapterRecruitsHTML;


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
      divTrackables.innerHTML += placeRecruitsHTML;
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
        <!--${placeRecruitsHTML}-->
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