export function SiteHeader({ onNavigate, variant = 'home' }) {
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
              <rect width="32" height="32" rx="9" fill="url(#brand-grad)" />
              <path
                fill="#fff"
                d="M10 10h5v12h-5V10Zm7 0h5l-3 6 3 6h-5l-3-6 3-6Z"
              />
              <defs>
                <linearGradient id="brand-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#818cf8" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span>
            <span className="site-header__name">UtiliKit</span>
            <span className="site-header__tagline">Ferramentas online</span>
          </span>
        </a>

        <nav className="site-header__nav" aria-label="Principal">
          <a
            href="/"
            className="site-header__link"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
          >
            Início
          </a>
          <a
            href="/contador-youtube"
            className="site-header__link site-header__link--accent"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/contador-youtube');
            }}
          >
            YouTube
          </a>
        </nav>
      </div>
    </header>
  );
}
