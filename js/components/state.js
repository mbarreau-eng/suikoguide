import { guideData } from '../data.js';

export const AppState = {
  guide: guideData,
  // Default to numeric 1 or first chapter's numeric id
  currentChapterId: guideData?.chapters?.[0]?.id ?? 1,

  getCurrentChapter() {
    if (!this.guide?.chapters) return null;
    // Loose equality (==) matches both numeric 1 and string "1"
    return this.guide.chapters.find(ch => ch.id == this.currentChapterId) || this.guide.chapters[0];
  },

  setChapter(chapterId) {
    // Cast to number if numeric, otherwise keep as is
    const parsed = Number(chapterId);
    this.currentChapterId = isNaN(parsed) ? chapterId : parsed;
  },

  setSearchQuery(query) {
    this.searchQuery = query.toLowerCase().trim();
  }
};