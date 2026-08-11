gameId = sessionStorage.getItem('game');

function renderHQView(container) {

  const trackables = document.getElementById('trackables');
  trackables.innerHTML = '';
  
  const main = document.getElementById(container);
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

  const bgPicture = hq.picture ? `./${gameId}/img/hq/${hq.picture}` : '';
  const levels = Array.isArray(hq.levels) ? hq.levels : [];
  const facilities = Array.isArray(hq.facilities) ? hq.facilities : [];

  main.innerHTML = `
    <!--<section class="hq-header-card" ${bgPicture ? `style="background-image: linear-gradient(rgba(15, 15, 22, 0.2), rgba(15, 15, 22, 0.95)), url('${bgPicture}');"` : ''}>-->
    <div class="chapter-header-card" >
      <div class="hq-header-content">
        <!--<span class="hq-badge">🏰 CASTLE HEADQUARTERS</span>-->
        <h2 class="chapter-title">Headquarters Upgrades & Facilities</h2>
        <p style="color: var(--text-muted); margin-top: 6px;">Track castle growth, level unlock conditions, and available facilities.</p>
      </div>
    </div>

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
 <!--                   ${isFacilityUnlocked ? '✓ Unlocked' : `🔒 Needs Recruit #${recruitId}`} -->
                        <!--${isFacilityUnlocked ? '✓ Unlocked' : `🔒 Needs ${recruitInfo.name}`}-->
                        ${isFacilityUnlocked ? '✓ Unlocked' : `🔒 Locked`}
                  </span>
                </div>
                
                <div class="hq-facility-body">
                  <div class="facility-unlocked-by" data-recruit-key="${rawUnlock || ''}">
                    <small>Unlocked By:</small>
                    ${recruitInfo ? `
                      <div class="hq-recruit-unlock">
                        <img 
                          src="${recruitInfo.pictureO}" 
                          alt="${recruitInfo.name}" 
                          class="hq-recruit-thumb original" 
                          onerror="this.style.display='none'"
                        />
                        <img 
                          src="${recruitInfo.pictureR}" 
                          alt="${recruitInfo.name}" 
                          class="hq-recruit-thumb remaster" 
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