const KEYS = {
  THEME: 'suikoden_theme',
  PROGRESS: 'suikoden_progress',
  RECRUITS: 'suikoden_recruits'
};

export const Storage = {
  getTheme() {
    return localStorage.getItem(KEYS.THEME) || 'dark';
  },
  
  setTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
  },

  getCompletedTasks() {
    return JSON.parse(localStorage.getItem(KEYS.PROGRESS)) || [];
  },

  toggleTask(taskId) {
    const completed = this.getCompletedTasks();
    const index = completed.indexOf(taskId);
    if (index > -1) {
      completed.splice(index, 1);
    } else {
      completed.push(taskId);
    }
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(completed));
    return completed;
  }
};