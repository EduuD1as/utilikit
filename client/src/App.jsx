import { useCallback, useEffect, useState, lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { CookieConsentProvider } from './context/CookieConsentContext.jsx';
import { CookieBanner } from './components/CookieBanner.jsx';
import { SEO } from './components/SEO.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { SqlFormatterPage } from './pages/SqlFormatterPage.jsx';
import { JsonFormatterPage } from './pages/JsonFormatterPage.jsx';
import { CurrencyConverterPage } from './pages/CurrencyConverterPage.jsx';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.jsx';
import { TermsPage } from './pages/TermsPage.jsx';
import { CharacterCounterPage } from './pages/CharacterCounterPage.jsx';
import { UnitConverterPage } from './pages/UnitConverterPage.jsx';
import { QRGeneratorPage } from './pages/QRGeneratorPage.jsx';
import { GeneratorPage } from './pages/GeneratorPage.jsx';
import { TimerPage } from './pages/TimerPage.jsx';
import MemoryGamePage from './pages/MemoryGamePage.jsx';
import RandomPickerPage from './pages/RandomPickerPage.jsx';
import { Base64EncoderPage } from './pages/Base64EncoderPage.jsx';

const ROUTES = {
  '/': HomePage,
  '/formatador-sql': SqlFormatterPage,
  '/formatador-json': JsonFormatterPage,
  '/conversor-moedas': CurrencyConverterPage,
  '/contador-caracteres': CharacterCounterPage,
  '/conversor-unidades': UnitConverterPage,
  '/gerador-qr': QRGeneratorPage,
  '/gerador-id-hash': GeneratorPage,
  '/timer-pomodoro': TimerPage,
  '/jogo-memoria': MemoryGamePage,
  '/roleta-sorteador': RandomPickerPage,
  '/codificador-base64': Base64EncoderPage,
  '/privacidade': PrivacyPolicyPage,
  '/termos': TermsPage,
};

function normalizePath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  return ROUTES[path] ? path : '/';
}

export default function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  const navigate = useCallback((to) => {
    const next = normalizePath(to);
    if (next !== window.location.pathname) {
      window.history.pushState({}, '', next);
    }
    setPath(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const Page = ROUTES[path] ?? HomePage;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <CookieConsentProvider>
          <SEO path={path} />
          <Suspense fallback={<div className="app"><main className="panel"><p>Carregando...</p></main></div>}>
            <Page onNavigate={navigate} />
          </Suspense>
          <CookieBanner onNavigate={navigate} />
        </CookieConsentProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}