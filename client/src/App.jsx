import { Component, Suspense, lazy } from 'react';
import { PreferencesProvider, useT } from './context/PreferencesContext.jsx';
import { ConsentProvider } from './context/ConsentContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { RouterProvider, useRouter } from './context/RouterContext.jsx';
import { TOOLS_BY_PATH } from './data/tools.js';
import { Shell } from './components/Shell.jsx';
import { CookieBanner } from './components/CookieBanner.jsx';
import { Seo } from './components/Seo.jsx';
import HomePage from './pages/HomePage.jsx';

const LegalPage = lazy(() => import('./pages/LegalPage.jsx'));

const STATIC_ROUTES = {
  '/': () => <HomePage />,
  '/privacidade': () => <LegalPage kind="privacy" />,
  '/termos': () => <LegalPage kind="terms" />,
};

function NotFound() {
  const t = useT();
  const { navigate } = useRouter();
  return (
    <div className="tool empty-state">
      <p className="empty-state__code">404</p>
      <h1>{t('notFound.title')}</h1>
      <p className="muted">{t('notFound.text')}</p>
      <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
        {t('notFound.action')}
      </button>
    </div>
  );
}

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.path !== this.props.path && this.state.error) this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="tool empty-state">
          <p className="empty-state__code">erro</p>
          <h1>{this.props.title}</h1>
          <p className="muted">{String(this.state.error.message || this.state.error)}</p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            {this.props.action}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Routes() {
  const { path } = useRouter();
  const t = useT();
  const tool = TOOLS_BY_PATH[path];
  const render = STATIC_ROUTES[path];

  let page;
  if (tool) {
    const Page = tool.component;
    page = <Page key={tool.id} />;
  } else if (render) {
    page = render();
  } else {
    page = <NotFound />;
  }

  return (
    <ErrorBoundary path={path} title={t('errors.crashTitle')} action={t('errors.reload')}>
      <Suspense fallback={<div className="tool loading" aria-busy="true" />}>{page}</Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <ConsentProvider>
        <RouterProvider>
          <ToastProvider>
            <Seo />
            <Shell>
              <Routes />
            </Shell>
            <CookieBanner />
          </ToastProvider>
        </RouterProvider>
      </ConsentProvider>
    </PreferencesProvider>
  );
}
