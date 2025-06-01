// Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || this.getSystemTheme();
        this.handsontableThemes = {
            dark: 'ht-theme-horizon-dark',
            light: 'ht-theme-main'
        };
        // Independent Handsontable theme selection - domyślnie 'auto'
        this.currentHandsontableTheme = localStorage.getItem('handsontable-theme') || 'auto';
        this.availableHandsontableThemes = {
            'auto': '🔄 Auto (zgodnie z motywem strony)',
            'ht-theme-main': '☀️ Main Light',
            'ht-theme-horizon': '🌅 Horizon Light',
            'ht-theme-main-dark': '🌙 Main Dark',
            'ht-theme-horizon-dark': '🌃 Horizon Dark',
            'ht-no-theme': '❌ Brak motywu'
        };

        // DOM element cache for performance
        this.cachedElements = {
            themeToggle: null,
            themeIcon: null,
            themeText: null,
            handsontableContainer: null
        };

        // Set initial theme attribute
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        this.init();
    }

    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupToggle();
        this.setupSystemThemeListener();
        this.initHandsontableThemes();
        // setupHandsontableThemeSelect will be called directly from editableTable.js when ready
    }

    initHandsontableThemes() {
        // Remove any existing Handsontable theme classes from container
        const container = document.getElementById('handsontable-container');
        if (container) {
            this.removeAllHandsontableThemes(container);

            const themeToApply = this.getEffectiveHandsontableTheme();
            if (themeToApply && themeToApply !== 'ht-no-theme' && themeToApply !== 'auto') {
                container.classList.add(themeToApply);
            }
        }
    }

    getEffectiveHandsontableTheme() {
        // Jeśli wybrano 'auto' lub nie ma ustawienia, użyj motywu zgodnego z motywem strony
        if (this.currentHandsontableTheme === 'auto' || !this.currentHandsontableTheme) {
            return this.handsontableThemes[this.currentTheme];
        }
        // W przeciwnym razie użyj wybranego motywu
        return this.currentHandsontableTheme;
    }

    setupHandsontableThemeSelect() {
        // More efficient approach - use MutationObserver or direct setup
        const setupSelect = () => {
            const select = document.getElementById('handsontable-theme-select');
            if (select && !select.dataset.themeSetup) {
                // Mark as set up to avoid duplicate setup
                select.dataset.themeSetup = 'true';

                // Set current value
                select.value = this.currentHandsontableTheme || 'auto';

                // Listen for changes
                select.addEventListener('change', (e) => {
                    this.setHandsontableTheme(e.target.value);
                });

                console.log('📋 Handsontable theme selector initialized');
                return true;
            }
            return false;
        };

        // Try immediate setup
        if (setupSelect()) return;

        // If element doesn't exist yet, use MutationObserver (more efficient than setTimeout)
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    if (setupSelect()) {
                        observer.disconnect();
                        return;
                    }
                }
            }
        });

        // Auto-disconnect observer after reasonable time to prevent memory leaks
        const maxObserveTime = 5000; // 5 seconds max
        const observerTimeout = setTimeout(() => {
            observer.disconnect();
            console.warn('⚠️ Handsontable theme selector setup timed out after 5s');
        }, maxObserveTime);

        // Start observing when DOM is ready
        const startObserving = () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startObserving);
        } else {
            startObserving();
        }

        // Fallback timeout - much shorter and only as last resort
        setTimeout(() => {
            if (setupSelect()) {
                observer.disconnect();
                clearTimeout(observerTimeout);
            }
        }, 50);
    }

    setHandsontableTheme(theme) {
        this.currentHandsontableTheme = theme;
        localStorage.setItem('handsontable-theme', theme);

        // Określ jaki motyw rzeczywiście zastosować
        const effectiveTheme = this.getEffectiveHandsontableTheme();

        // Log the theme change for user feedback
        const themeName = this.availableHandsontableThemes[theme] || theme;
        console.log(`🎨 Handsontable theme changed to: ${themeName}`);
        if (theme === 'auto') {
            console.log(`↳ Auto mode: Using ${effectiveTheme} (matches ${this.currentTheme} main theme)`);
        } else {
            console.log(`↳ Independent mode: Using ${effectiveTheme}`);
        }

        // Apply theme to all containers
        const containers = document.querySelectorAll('#handsontable-container, .handsontable');
        containers.forEach(container => {
            this.removeAllHandsontableThemes(container);
            if (effectiveTheme && effectiveTheme !== 'ht-no-theme' && effectiveTheme !== 'auto') {
                container.classList.add(effectiveTheme);
            }
        });

        // Emit event for external listeners
        document.dispatchEvent(new CustomEvent('handsontableThemeChanged', {
            detail: {
                theme: effectiveTheme,
                selectedTheme: theme,
                isAuto: theme === 'auto',
                themeName: themeName
            }
        }));
    }

    removeAllHandsontableThemes(element) {
        if (!element) return;
        Object.keys(this.availableHandsontableThemes).forEach(theme => {
            if (theme !== 'ht-no-theme' && theme !== 'auto') {
                element.classList.remove(theme);
            }
        });
    }

    applyTheme(theme) {
        // Apply main theme using data-theme attribute to match styles.css
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);

        this.currentTheme = theme;
        localStorage.setItem('theme', theme);

        // Update theme toggle button
        this.updateThemeToggleButton(theme);

        // Jeśli Handsontable theme jest ustawiony na 'auto', zaktualizuj go
        if (this.currentHandsontableTheme === 'auto' || !this.currentHandsontableTheme) {
            this.initHandsontableThemes();
        }

        // Emit event for external listeners
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: {
                theme: theme,
                handsontableTheme: this.getEffectiveHandsontableTheme(),
                isHandsontableAuto: this.currentHandsontableTheme === 'auto'
            }
        }));
    }

    updateThemeToggleButton(theme) {
        // Use cached elements or get them once
        const toggleBtn = this.cachedElements.themeToggle ||
            (this.cachedElements.themeToggle = document.getElementById('theme-toggle'));
        const themeIcon = this.cachedElements.themeIcon ||
            (this.cachedElements.themeIcon = document.getElementById('theme-icon'));
        const themeText = this.cachedElements.themeText ||
            (this.cachedElements.themeText = document.getElementById('theme-text'));

        if (toggleBtn && themeIcon && themeText) {
            if (theme === 'dark') {
                themeIcon.className = 'bi bi-sun-fill';
                toggleBtn.title = 'Przełącz na jasny motyw';
            } else {
                themeIcon.className = 'bi bi-moon-fill';
                toggleBtn.title = 'Przełącz na ciemny motyw';
            }
        }
    }

    setupToggle() {
        // Funkcja do konfiguracji przycisku
        const setupThemeButton = () => {
            const toggleBtn = document.getElementById('theme-toggle');
            if (toggleBtn && !toggleBtn.dataset.themeSetup) {
                // Oznacz przycisk jako skonfigurowany
                toggleBtn.dataset.themeSetup = 'true';

                // Dodaj event listener
                toggleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleTheme();
                });

                // Cache element
                this.cachedElements.themeToggle = toggleBtn;
                this.cachedElements.themeIcon = document.getElementById('theme-icon');
                this.cachedElements.themeText = document.getElementById('theme-text');

                // Update button appearance
                this.updateThemeToggleButton(this.currentTheme);

                console.log('🎨 Theme toggle button initialized');
                return true;
            }
            return false;
        };

        // Spróbuj natychmiastowej konfiguracji
        if (setupThemeButton()) return;

        // Jeśli przycisk nie istnieje jeszcze (React może go jeszcze nie wyrenderować),
        // użyj MutationObserver
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    if (setupThemeButton()) {
                        observer.disconnect();
                        return;
                    }
                }
            }
        });

        // Zabezpieczenie przed wiecznym nasłuchiwaniem
        const maxObserveTime = 10000; // 10 sekund
        const observerTimeout = setTimeout(() => {
            observer.disconnect();
            console.warn('⚠️ Theme toggle setup timed out after 10s');
        }, maxObserveTime);

        // Rozpocznij obserwację
        const startObserving = () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startObserving);
        } else {
            startObserving();
        }

        // Dodatkowe sprawdzenia co 100ms przez pierwszą sekundę
        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(() => {
            attempts++;
            if (setupThemeButton() || attempts >= maxAttempts) {
                clearInterval(interval);
                if (setupThemeButton()) {
                    observer.disconnect();
                    clearTimeout(observerTimeout);
                }
            }
        }, 100);
    }

    setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(mediaQuery.matches ? 'dark' : 'light');
                }
            });
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }

    getTheme() {
        return this.currentTheme;
    }

    getHandsontableTheme() {
        return this.getEffectiveHandsontableTheme();
    }

    getSelectedHandsontableTheme() {
        return this.currentHandsontableTheme || 'auto';
    }

    getAvailableHandsontableThemes() {
        return this.availableHandsontableThemes;
    }

    isDarkTheme() {
        return this.currentTheme === 'dark';
    }

    setLightTheme() {
        this.applyTheme('light');
    }

    setDarkTheme() {
        this.applyTheme('dark');
    }

    // Cross-tab synchronization
    syncThemeAcrossTabs() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                this.applyTheme(e.newValue || 'dark');
            }
            if (e.key === 'handsontable-theme') {
                this.currentHandsontableTheme = e.newValue || 'auto';
                this.initHandsontableThemes();
            }
        });
    }

    // Advanced theme utilities
    extractThemeColors() {
        const computedStyle = getComputedStyle(document.body);
        return {
            primary: computedStyle.getPropertyValue('--color-primary').trim(),
            secondary: computedStyle.getPropertyValue('--color-secondary').trim(),
            background: computedStyle.getPropertyValue('--bg-color').trim(),
            text: computedStyle.getPropertyValue('--text-color').trim()
        };
    }

    updateComponentThemes() {
        // Update all theme-aware components
        const components = document.querySelectorAll('[data-theme-aware]');
        components.forEach(component => {
            component.classList.remove('theme-light', 'theme-dark');
            component.classList.add(`theme-${this.currentTheme}`);
        });
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.themeManager.syncThemeAcrossTabs();

    // Expose theme methods globally for easy access
    window.toggleTheme = () => window.themeManager.toggleTheme();
    window.getTheme = () => window.themeManager.getTheme();
    window.getHandsontableTheme = () => window.themeManager.getHandsontableTheme();
    window.setHandsontableTheme = (theme) => window.themeManager.setHandsontableTheme(theme);
    window.isDarkTheme = () => window.themeManager.isDarkTheme();

    console.log('Theme Manager initialized:', window.themeManager.getTheme());
    console.log('Handsontable theme:', window.themeManager.getHandsontableTheme());
});

// Listen for theme changes from other tabs/windows
window.addEventListener('storage', (e) => {
    if (e.key === 'theme' && window.themeManager) {
        window.themeManager.applyTheme(e.newValue || window.themeManager.getSystemTheme());
    }
    if (e.key === 'handsontable-theme' && window.themeManager) {
        window.themeManager.currentHandsontableTheme = e.newValue || 'auto';
        window.themeManager.initHandsontableThemes();
    }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}

// AMD support
if (typeof define === 'function' && define.amd) {
    define([], function () {
        return ThemeManager;
    });
} 