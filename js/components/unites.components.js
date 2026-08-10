gameId = sessionStorage.getItem('game');

function renderUniteCard(unite, allRecruits) {
  return `
    <div class="unite-card">
      <div class="unite-card-header">
        <h3>${unite.name}</h3>
      </div>

      <div class="unite-characters">
        ${unite.participants.map(id => {
          const recruit = allRecruits.find(r => String(r.id) === String(id));

          if (!recruit) {
            return `
              <div class="unite-char-container">
                <div class="unite-char-avatar missing">?</div>
                <span class="unite-char-name">ID #${id}</span>
              </div>
            `;
          }

          return `
            <div class="unite-char-container">
              <div class="unite-char-avatar">
                <img 
                  src="./${gameId}/img/stars/original/${recruit.name.replace(/\s/g, '')}.png" 
                  alt="${recruit.name}" 
                  onerror="this.src='img/placeholder.png'" 
                  class="original"
                />
                <img 
                  src="./${gameId}/img/stars/remaster/${recruit.name.replace(/\s/g, '')}.png" 
                  alt="${recruit.name}" 
                  onerror="this.src='img/placeholder.png'" 
                  class="remaster"
                />
              </div>
              <span class="unite-char-name">${recruit.name}</span>
              
              <div class="recruit-tooltip">
                <strong>${recruit.name}</strong>
                <ul>
                  ${recruit.range ? `<li>🎯 Range: <span>${recruit.range}</span></li>` : ''}
                  ${recruit.condition ? `<li>🤝 <span>${recruit.condition}</span></li>` : ''}
                </ul>
              </div>
            </div>
          `;
        }).join('<span class="unite-plus">+</span>')}
      </div>

      <div class="unite-effect">
        <strong>Effect:</strong> ${unite.effect}
      </div>
    </div>
  `;
}