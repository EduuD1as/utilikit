import { useCallback, useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage.jsx';
import { YouTubeCounterPage } from './pages/YouTubeCounterPage.jsx';

const ROUTES = {
  '/': HomePage,
  '/contador-youtube': YouTubeCounterPage,
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
  return <Page onNavigate={navigate} />;
}
