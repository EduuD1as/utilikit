import { useEffect, useMemo, useRef, useState } from 'react';
import { searchTools } from '../data/tools.js';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { useRouter } from '../context/RouterContext.jsx';
import { Icon } from './Icon.jsx';

export function CommandPalette({ open, onClose }) {
  const { t } = usePreferences();
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => searchTools(query, t), [query, t]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const go = (tool) => {
    if (!tool) return;
    onClose();
    navigate(tool.path);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(results[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div className="palette" role="presentation" onMouseDown={onClose}>
      <div
        className="palette__panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('shell.search')}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="palette__input">
          <Icon name="search" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('shell.searchPlaceholder')}
            aria-label={t('shell.search')}
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
            spellCheck={false}
            autoComplete="off"
          />
          <kbd>Esc</kbd>
        </div>
        <ul id="palette-results" className="palette__list" role="listbox" ref={listRef}>
          {results.length === 0 && <li className="palette__empty">{t('shell.noResults')}</li>}
          {results.map((tool, index) => (
            <li
              key={tool.id}
              id={`palette-${tool.id}`}
              role="option"
              aria-selected={index === active}
              className="palette__item"
              onMouseMove={() => setActive(index)}
              onClick={() => go(tool)}
            >
              <Icon name={tool.icon} />
              <span className="palette__name">{t(`tools.${tool.id}.name`)}</span>
              <span className="palette__path">{tool.path}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
