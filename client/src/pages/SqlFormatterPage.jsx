import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePreferences } from '../context/PreferencesContext.jsx';
import { CodeEditor } from '../components/CodeEditor.jsx';
import {
  Button,
  Checkbox,
  CopyButton,
  IconButton,
  Kbd,
  Notice,
  Pane,
  Segmented,
  Select,
  Spacer,
  ToolHeader,
  Toolbar,
  downloadText,
} from '../components/ui.jsx';
import { SQL_DIALECTS, formatSql, minifySql } from '../lib/sql.js';
import { highlightSql } from '../lib/highlight.js';
import { readJson, writeJson } from '../lib/storage.js';

const EXAMPLE = `select c.id, c.nome, count(p.id) as pedidos, sum(p.total) total
from clientes c left join pedidos p on p.cliente_id = c.id and p.status <> 'cancelado'
where c.ativo = 1 and c.criado_em >= :data_inicio
group by c.id, c.nome having sum(p.total) > 1000 order by total desc;`;

const DEFAULTS = {
  dialect: 'sql',
  keywordCase: 'upper',
  indent: '2',
  logicalOperatorNewline: 'before',
  expressionWidth: 50,
  linesBetweenQueries: 1,
  denseOperators: false,
  auto: true,
};

const STORAGE_KEY = 'utilikit-sql-options';

function stats(text) {
  if (!text) return '0 B';
  const lines = text.split('\n').length;
  const bytes = new TextEncoder().encode(text).length;
  return `${lines} ln · ${bytes.toLocaleString()} B`;
}

export default function SqlFormatterPage() {
  const { t } = usePreferences();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('format');
  const [options, setOptions] = useState(() => ({ ...DEFAULTS, ...readJson(STORAGE_KEY, {}) }));
  const [showMore, setShowMore] = useState(false);
  const [result, setResult] = useState({ output: '', error: null, fallback: null });

  useEffect(() => writeJson(STORAGE_KEY, options), [options]);

  const set = (key) => (value) => setOptions((prev) => ({ ...prev, [key]: value }));

  const run = useCallback(
    (nextMode = mode) => {
      setMode(nextMode);
      const source = input.trim();
      if (!source) {
        setResult({ output: '', error: null, fallback: null });
        return;
      }
      if (nextMode === 'minify') {
        setResult({ output: minifySql(source, { dialect: options.dialect }), error: null, fallback: null });
        return;
      }
      try {
        const { output, usedDialect, fallback } = formatSql(source, options);
        setResult({ output, error: null, fallback: fallback ? usedDialect : null });
      } catch (error) {
        setResult({ output: '', error, fallback: null });
      }
    },
    [input, options, mode]
  );

  // Formatação automática enquanto digita (com pequeno atraso).
  useEffect(() => {
    if (!options.auto) return undefined;
    const id = setTimeout(() => run(mode), 180);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, options]);

  const onKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      run(event.shiftKey ? 'minify' : 'format');
    }
  };

  const dialectOptions = useMemo(
    () =>
      SQL_DIALECTS.map((d) => ({
        value: d.id,
        label: d.id === 'sql' ? t('sql.genericDialect') : d.label,
      })),
    [t]
  );

  const fallbackLabel = SQL_DIALECTS.find((d) => d.id === result.fallback)?.label;
  const chosenLabel = dialectOptions.find((d) => d.value === options.dialect)?.label;

  return (
    <div className="tool" onKeyDown={onKeyDown}>
      <ToolHeader title={t('tools.sql.name')} description={t('tools.sql.long')} />

      <Toolbar>
        <Select
          label={t('sql.dialect')}
          value={options.dialect}
          onChange={set('dialect')}
          options={dialectOptions}
        />
        <div className="field">
          <span className="field__label">{t('sql.keywords')}</span>
          <Segmented
            label={t('sql.keywords')}
            value={options.keywordCase}
            onChange={set('keywordCase')}
            options={[
              { value: 'upper', label: 'SELECT' },
              { value: 'lower', label: 'select' },
              { value: 'preserve', label: t('sql.preserve') },
            ]}
          />
        </div>
        <Select
          label={t('common.indent')}
          value={options.indent}
          onChange={set('indent')}
          options={[
            { value: '2', label: t('common.spaces', { n: 2 }) },
            { value: '4', label: t('common.spaces', { n: 4 }) },
            { value: 'tab', label: 'Tab' },
          ]}
        />
        <Spacer />
        <div className="toolbar__group">
          <Button variant="primary" icon="wrap" onClick={() => run('format')} title="Ctrl+Enter">
            {t('sql.format')}
          </Button>
          <Button onClick={() => run('minify')} title="Ctrl+Shift+Enter">
            {t('common.minify')}
          </Button>
        </div>
      </Toolbar>

      <div className="toolbar toolbar--sub">
        <Checkbox label={t('common.autoFormat')} checked={options.auto} onChange={set('auto')} />
        <button type="button" className="link-btn" onClick={() => setShowMore((v) => !v)} aria-expanded={showMore}>
          {showMore ? t('common.lessOptions') : t('common.moreOptions')}
        </button>
        <Spacer />
        <span className="hint">
          <Kbd>Ctrl</Kbd> <Kbd>Enter</Kbd> {t('sql.format').toLowerCase()}
        </span>
      </div>

      {showMore && (
        <div className="toolbar toolbar--options">
          <Select
            label={t('sql.logicalOperators')}
            value={options.logicalOperatorNewline}
            onChange={set('logicalOperatorNewline')}
            options={[
              { value: 'before', label: t('sql.operatorBefore') },
              { value: 'after', label: t('sql.operatorAfter') },
            ]}
          />
          <Select
            label={t('sql.expressionWidth')}
            value={String(options.expressionWidth)}
            onChange={(v) => set('expressionWidth')(Number(v))}
            options={[30, 50, 80, 120].map((n) => ({ value: String(n), label: t('sql.columns', { n }) }))}
          />
          <Select
            label={t('sql.linesBetween')}
            value={String(options.linesBetweenQueries)}
            onChange={(v) => set('linesBetweenQueries')(Number(v))}
            options={[0, 1, 2].map((n) => ({ value: String(n), label: String(n) }))}
          />
          <Checkbox label={t('sql.denseOperators')} checked={options.denseOperators} onChange={set('denseOperators')} />
        </div>
      )}

      {result.error && (
        <Notice tone="error">
          <strong>{t('sql.parseError')}</strong>{' '}
          {result.error.message === 'EOF'
            ? t('sql.parseErrorEof')
            : result.error.line
            ? t('sql.parseErrorAt', {
                token: result.error.message,
                line: result.error.line,
                column: result.error.column,
              })
            : result.error.message}
          <br />
          <span className="muted">{t('sql.parseErrorHint')}</span>
        </Notice>
      )}
      {result.fallback && !result.error && (
        <Notice tone="info">{t('sql.fallback', { chosen: chosenLabel, used: fallbackLabel })}</Notice>
      )}

      <div className="split">
        <Pane
          title={t('common.input')}
          meta={stats(input)}
          status={result.error ? 'error' : undefined}
          actions={
            <>
              <Button size="sm" variant="ghost" onClick={() => setInput(EXAMPLE)}>
                {t('common.example')}
              </Button>
              <IconButton icon="trash" label={t('common.clear')} onClick={() => setInput('')} disabled={!input} />
            </>
          }
        >
          <CodeEditor
            value={input}
            onChange={setInput}
            highlight={highlightSql}
            placeholder={t('sql.placeholder')}
            errorLine={result.error?.line}
            label={t('common.input')}
          />
        </Pane>
        <Pane
          title={mode === 'minify' ? t('common.minified') : t('common.output')}
          meta={stats(result.output)}
          actions={
            <>
              <IconButton
                icon="download"
                label={t('common.download')}
                onClick={() => downloadText('query.sql', result.output)}
                disabled={!result.output}
              />
              <CopyButton value={result.output} iconOnly />
            </>
          }
        >
          <CodeEditor
            value={result.output}
            readOnly
            highlight={highlightSql}
            placeholder={t('sql.outputPlaceholder')}
            label={t('common.output')}
          />
        </Pane>
      </div>
    </div>
  );
}
