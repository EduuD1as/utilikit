import { useEffect } from 'react';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useRouter } from '../context/RouterContext.jsx';
import { TOOLS_BY_PATH } from '../data/tools.js';

const SITE = 'https://utilikit.com.br';

function setMeta(selector, attr, key, content) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute(selector.startsWith('link') ? 'href' : 'content', content);
}

/** Atualiza título, descrição, canonical e Open Graph conforme a rota. */
export function Seo() {
  const { t, language } = usePreferences();
  const { path } = useRouter();

  useEffect(() => {
    const tool = TOOLS_BY_PATH[path];
    let title;
    let description;
    if (tool) {
      title = `${t(`tools.${tool.id}.name`)} — UtiliKit`;
      description = t(`tools.${tool.id}.long`);
    } else if (path === '/privacidade') {
      title = `${t('legal.privacyTitle')} — UtiliKit`;
      description = t('legal.privacyIntro');
    } else if (path === '/termos') {
      title = `${t('legal.termsTitle')} — UtiliKit`;
      description = t('legal.termsIntro');
    } else {
      title = t('seo.homeTitle');
      description = t('seo.homeDescription');
    }

    const url = `${SITE}${path === '/' ? '/' : path}`;
    document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('link[rel="canonical"]', 'rel', 'canonical', url);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', language === 'pt' ? 'pt_BR' : 'en_US');
  }, [path, t, language]);

  return null;
}
