import { useCallback, useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CookieConsentProvider } from './context/CookieConsentContext.jsx';
import { CookieBanner } from './components/CookieBanner.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { YouTubeCounterPage } from './pages/YouTubeCounterPage.jsx';
import { SqlFormatterPage } from './pages/SqlFormatterPage.jsx';
import { JsonFormatterPage } from './pages/JsonFormatterPage.jsx';
import { DocumentConverterPage } from './pages/DocumentConverterPage.jsx';
import { CurrencyConverterPage } from './pages/CurrencyConverterPage.jsx';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.jsx';
import { TermsPage } from './pages/TermsPage.jsx';
import { CharacterCounterPage } from './pages/CharacterCounterPage.jsx';
import { SimpleCalculatorPage } from './pages/SimpleCalculatorPage.jsx';
import { UnitConverterPage } from './pages/UnitConverterPage.jsx';
import { QRGeneratorPage } from './pages/QRGeneratorPage.jsx';
import { GeneratorPage } from './pages/GeneratorPage.jsx';
import { TimerPage } from './pages/TimerPage.jsx';

const ROUTES = {
  '/': HomePage,
  '/contador-youtube': YouTubeCounterPage,
  '/formatador-sql': SqlFormatterPage,
  '/formatador-json': JsonFormatterPage,
  '/conversor-documentos': DocumentConverterPage,
  '/conversor-moedas': CurrencyConverterPage,
  '/contador-caracteres': CharacterCounterPage,
  '/calculadora': SimpleCalculatorPage,
  '/conversor-unidades': UnitConverterPage,
  '/gerador-qr': QRGeneratorPage,
  '/gerador-id-hash': GeneratorPage,
  '/timer-pomodoro': TimerPage,
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
      <CookieConsentProvider>
        <Page onNavigate={navigate} />
        <CookieBanner onNavigate={navigate} />
      </CookieConsentProvider>
    </ThemeProvider>
  );
}