import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export function SiteHeader({ onNavigate, variant = 'home' }) {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className={`site-header site-header--${variant}`}>
      <div className="site-header__inner">
        <a
          href="/"
          className="site-header__brand"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
        >
          <span className="site-header__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="32" height="32">
              <rect width="32" height="32" rx="7" fill="url(#brand-grad)" />
              <g fill="#fff">
                <rect x="7.5" y="7.5" width="7" height="7" rx="2" />
                <rect x="17.5" y="7.5" width="7" height="7" rx="2" />
                <rect x="7.5" y="17.5" width="7" height="7" rx="2" />
                <rect x="17.5" y="17.5" width="7" height="7" rx="2" />
              </g>
              <defs>
                <linearGradient id="brand-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#a78bfa" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span>
            <span className="site-header__name">{t('brandName')}</span>
          </span>
        </a>

        <nav className="site-header__nav" aria-label="Principal">
          {variant !== 'home' && (
            <a
              href="/"
              className="site-header__link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
            >
              {t('navHome')}
            </a>
          )}

          <button
            className="site-header__lang-toggle"
            onClick={toggleLanguage}
            aria-label={t('languageToggle')}
            title={t('languageToggle')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="site-header__lang-text">
              {language === 'pt' ? 'EN' : 'PT-BR'}
            </span>
          </button>

          <button
            className="site-header__theme-toggle"
            onClick={toggleTheme}
            aria-label={`${t('themeToggle')} ${theme === 'dark' ? t('themeDark') : t('themeLight')}`}
            title={`${t('themeToggle')} ${theme === 'dark' ? t('themeDark') : t('themeLight')}`}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
