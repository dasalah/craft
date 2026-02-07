// Theme Management - Dark/Light Mode

class ThemeManager {
  constructor() {
    this.storageKey = 'appTheme';
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
    this.setupToggle();
  }

  loadTheme() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }

  applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    this.currentTheme = theme;
    localStorage.setItem(this.storageKey, theme);
    this.updateToggleIcon();
  }

  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  setupToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  updateToggleIcon() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;

    const sunIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    `;

    const moonIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    `;

    toggleBtn.innerHTML = this.currentTheme === 'dark' ? sunIcon : moonIcon;
  }

  isDark() {
    return this.currentTheme === 'dark';
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Listen for system theme changes
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const newTheme = e.matches ? 'dark' : 'light';
    themeManager.applyTheme(newTheme);
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
