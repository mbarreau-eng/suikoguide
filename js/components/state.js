import { guideData } from '../data.js';

export const AppState = {
  guide: guideData,
  currentChapterId: guideData.chapters[0]?.id || 'ch1',
  searchQuery: '',

  getCurrentChapter() {
    return this.guide.chapters.find(ch => ch.id === this.currentChapterId) || this.guide.chapters[0];
  },

  setChapter(chapterId) {
    this.currentChapterId = chapterId;
  },

  setSearchQuery(query) {
    this.searchQuery = query.toLowerCase().trim();
  }
};