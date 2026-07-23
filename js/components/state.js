export const AppState = {
  currentChapterId: 'ch1',
  searchQuery: '',
  walkthroughData: null,

  setChapter(chapterId) {
    this.currentChapterId = chapterId;
  },

  setSearchQuery(query) {
    this.searchQuery = query.toLowerCase().trim();
  }
};