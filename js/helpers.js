gameId = sessionStorage.getItem('game');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeId(str) {
  return String(str).replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getImagePath(name, style) {
  if (!name) return '';
  const fileName = name.toLowerCase().replace(/\s+/g, '');
  return `./${gameId}/img/stars/${style}/${fileName}.png`;
}

function getChapterLabel(chapter) {
  if (!chapter) return 'Chapter';
  return `${chapter.id} - ${chapter.title}`;
}

function resolveRecruit(ref) {
  if (!guideData || !guideData.recruits) return null;

  let recruitId = null;
  let customOverrides = null;

  if (typeof ref === 'number' || (typeof ref === 'string' && !isNaN(Number(ref)))) {
    recruitId = Number(ref);
  } else if (ref && typeof ref === 'object') {
    if (ref.id !== undefined && ref.id !== null) {
      recruitId = Number(ref.id);
      customOverrides = ref;
    } else {
      return ref;
    }
  }

  if (recruitId !== null) {
    const found = guideData.recruits.find(r => r.id === recruitId);
    if (found) {
      return customOverrides ? { ...found, ...customOverrides } : found;
    }
  }

  return null;
}

function findRecruitData(key) {
  if (!key) return null;
  const rawKey = String(key).trim();
  const recruits = guideData.recruits || guideData.stars || [];

  if (Array.isArray(recruits)) {
    return recruits.find(r => 
      String(r.id) === rawKey || 
      String(r.star) === rawKey || 
      String(r.number) === rawKey ||
      (r.name && r.name.toLowerCase() === rawKey.toLowerCase())
    ) || null;
  } else if (typeof recruits === 'object' && recruits !== null) {
    if (recruits[rawKey]) return recruits[rawKey];
    return Object.values(recruits).find(r => 
      r.name && String(r.name).toLowerCase() === rawKey.toLowerCase()
    ) || null;
  }
  return null;
}

const getRecruitInfo = (unlockedBy) => {
  if (!unlockedBy && unlockedBy !== 0) return null;

  const rawKey = String(unlockedBy).trim();
  const found = findRecruitData(rawKey);
  const recruitName = found ? (found.name || found.character || rawKey) : rawKey;
  const picFileName = (found && found.picture) ? found.picture : `${recruitName}.png`;

  return {
    rawKey: rawKey,
    name: recruitName,
    pictureO: `./${gameId}/img/stars/original/${picFileName.toLowerCase()}`,
    pictureR: `./${gameId}/img/stars/remaster/${picFileName.toLowerCase()}`,
    isStar: !!found
  };
};


function enhanceParagraphText(text) {
  const recruits = guideData?.recruits || [];
  if (!recruits.length || !text) return text;

  // 1. Sort by length descending to match longer names first (e.g. "Rock V" before "Rock")
  const sortedRecruits = [...recruits].sort((a, b) => b.name.length - a.name.length);
  
  // 2. Map for O(1) case-sensitive lookups
  const recruitMap = new Map(sortedRecruits.map(r => [r.name, r]));

  // 3. Escape regex characters in names
  const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const namesPattern = sortedRecruits.map(r => escapeRegExp(r.name)).join('|');

  // 4. Combined Regex:
  //    Group 1: Matches [_..._] blocks (ignored)
  //    Group 2: Matches exact recruit names with word boundaries (processed)
  //    Flags: Removed 'i' for case-sensitivity
  const regex = new RegExp(`(\\[_[\\s\\S]*?_\\])|\\b(${namesPattern})\\b`, 'g');

  return text.replace(regex, (fullMatch, bracketedContent, matchedName) => {
    // If matched inside [_ ... _], leave it untouched
    if (bracketedContent) return bracketedContent;

    // Direct case-sensitive lookup
    const recruit = recruitMap.get(matchedName);
    if (!recruit) return matchedName;

    return `
      <span class="inline-recruit-mention">
        <span class="recruit-mention-text">${matchedName}</span>
        <span class="recruit-inline-tooltip">
          <span class="tooltip-header">
            <img 
              src="./${gameId}/img/stars/original/${recruit.name.toLowerCase().replace(/\s+/g, '')}.png" 
              alt="${recruit.name}" 
              onerror="this.src='img/placeholder.png'" 
              class="original"
            />
            <img 
              src="./${gameId}/img/stars/remaster/${recruit.name.toLowerCase().replace(/\s+/g, '')}.png" 
              alt="${recruit.name}" 
              onerror="this.src='img/placeholder.png'" 
              class="remaster"
            />
            <strong>${recruit.name}</strong>
          </span>
          <ul>
            ${recruit.star ? `<li>🌟 <span>${recruit.star}</span></li>` : ''}
            ${recruit.range ? `<li>🎯 <span>${recruit.range}</span></li>` : ''}
            ${recruit.condition ? `<li>📍 <span>${recruit.condition}</span></li>` : ''}
          </ul>
        </span>
      </span>
    `.replace(/\s+/g, ' ').trim();
  });
}