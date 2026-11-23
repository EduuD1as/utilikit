import { useEffect, useState } from 'react';
import { CATEGORIES, TOOLS, TOOLS_BY_PATH } from '../data/tools.js';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useConsent } from '../context/ConsentContext.jsx';
import { Link, useRouter } from '../context/RouterContext.jsx';
import { Icon } from './Icon.jsx';
import { CommandPalette } from './CommandPalette.jsx';

const REPO_URL = 'https://github.com/EduuD1as/utilikit';

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="UtiliKit">
      <svg className="brand__mark" viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
        <rect width="32" height="32" rx="7" className="brand__bg" />
        <path d="M8 10l6 6-6 6" className="brand__chevron" />
        <rect x="16" y="20" width="9" height="3" rx="1.2" className="brand__cursor" />
      </svg>
      <span className="brand__name">utilikit</span>
    </Link>
  );
}

function Sidebar({ open, onClose }) {
  const { t } = usePreferences();
  const { path } = useRouter();

  return (
    <>
      <div className={`scrim${open ? ' scrim--open' : ''}`} onClick={onClose} aria-hidden="true" />
      <nav className={`sidebar${open ? ' sidebar--open' : ''}`} aria-label={t('shell.toolsNav')}>
        {CATEGORIES.map((category) => (
          <div className="sidebar__group" key={category}>
            <p className="sidebar__heading">{t(`categories.${category}`)}</p>
            <ul>
              {TOOLS.filter((tool) => tool.category === category).map((tool) => {
                const active = tool.path === path;
                return (
                  <li key={tool.id}>
                    <Link
                      to={tool.path}
                      className={`sidebar__link${active ? ' sidebar__link--active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={onClose}
                    >
                      <Icon name={tool.icon} size={15} />
                      <span>{t(`tools.${tool.id}.name`)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}

export function Shell({ children }) {
  const { t, theme, language, toggleTheme, toggleLanguage } = usePreferences();
  const { openBanner } = useConsent();
  const { path } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => setMenuOpen(false), [path]);

  const isMac = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
  const tool = TOOLS_BY_PATH[path];

  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        {t('shell.skip')}
      </a>
      <header className="topbar">
        <button
          type="button"
          className="icon-btn topbar__menu"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={t('shell.menu')}
          aria-expanded={menuOpen}
        >
          <Icon name={menuOpen ? 'x' : 'menu'} />
        </button>
        <Brand />
        <span className="topbar__path" aria-hidden="true">
          ~{path === '/' ? '' : path}
        </span>

        <button type="button" className="search-trigger" onClick={() => setPaletteOpen(true)}>
          <Icon name="search" size={15} />
          <span className="search-trigger__label">{t('shell.search')}</span>
          <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
        </button>

        <div className="topbar__actions">
          <button
            type="button"
            className="icon-btn icon-btn--text"
            onClick={toggleLanguage}
            aria-label={t('shell.language')}
            title={t('shell.language')}
          >
            {language === 'pt' ? 'PT' : 'EN'}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('shell.lightTheme') : t('shell.darkTheme')}
            title={theme === 'dark' ? t('shell.lightTheme') : t('shell.darkTheme')}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <a
            className="icon-btn topbar__github"
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <Icon name="github" />
          </a>
        </div>
      </header>

      <div className="shell__body">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main id="main" className="main" tabIndex={-1}>
          {children}
        </main>
      </div>

      <footer className="statusbar">
        <span className="statusbar__local">
          <span className="statusbar__dot" aria-hidden="true" />
          {tool?.remote ? t('shell.statusRemote') : t('shell.statusLocal')}
        </span>
        <nav className="statusbar__links" aria-label={t('shell.legalNav')}>
          <Link to="/privacidade">{t('legal.privacyTitle')}</Link>
          <Link to="/termos">{t('legal.termsTitle')}</Link>
          <button type="button" onClick={openBanner}>
            {t('cookies.manage')}
          </button>
        </nav>
      </footer>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
