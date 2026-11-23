import { useEffect, useMemo, useState } from 'react';
import { usePageT } from '../context/PreferencesContext.jsx';
import { CodeEditor } from '../components/CodeEditor.jsx';
import {
  Button,
  Checkbox,
  CopyButton,
  IconButton,
  Notice,
  Pane,
  Segmented,
  Select,
  Spacer,
  ToolHeader,
  Toolbar,
  downloadText,
} from '../components/ui.jsx';
import { byteSize, describeJson, formatBytes, parseJson, sortKeysDeep } from '../lib/json.js';
import { highlightJson } from '../lib/highlight.js';
import { readJson, writeJson } from '../lib/storage.js';

const STRINGS = {
  pt: {
    placeholder: 'Cole seu JSON aqui',
    outputPlaceholder: 'O JSON formatado aparece aqui',
    invalid: 'JSON inválido',
    at: 'linha {line}, coluna {column}',
    valid: 'JSON válido',
    sortKeys: 'Ordenar chaves',
    mode: 'Modo',
    pretty: 'Formatado',
    compact: 'Minificado',
    summary: '{type} · {keys} chaves · profundidade {depth}',
    escape: 'Escapar como string',
  },
  en: {
    placeholder: 'Paste your JSON here',
    outputPlaceholder: 'Formatted JSON appears here',
    invalid: 'Invalid JSON',
    at: 'line {line}, column {column}',
    valid: 'Valid JSON',
    sortKeys: 'Sort keys',
    mode: 'Mode',
    pretty: 'Pretty',
    compact: 'Minified',
    summary: '{type} · {keys} keys · depth {depth}',
    escape: 'Escape as string',
  },
};

const EXAMPLE = '{"id":42,"nome":"UtiliKit","ativo":true,"tags":["sql","json"],"dono":{"login":"dev","desde":"2024-01-15"},"versao":null}';
const STORAGE_KEY = 'utilikit-json-options';

export default function JsonFormatterPage() {
  const t = usePageT(STRINGS);
  const [input, setInput] = useState('');
  const [options, setOptions] = useState(() => ({
    indent: '2',
    mode: 'pretty',
    sortKeys: false,
    escape: false,
    ...readJson(STORAGE_KEY, {}),
  }));

  useEffect(() => writeJson(STORAGE_KEY, options), [options]);
  const set = (key) => (value) => setOptions((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: null, info: null };
    const { value, error } = parseJson(input);
    if (error) return { output: '', error, info: null };
    const data = options.sortKeys ? sortKeysDeep(value) : value;
    const space = options.mode === 'compact' ? undefined : options.indent === 'tab' ? '\t' : Number(options.indent);
    let output = JSON.stringify(data, null, space);
    if (options.escape) output = JSON.stringify(output);
    return { output, error: null, info: describeJson(value) };
  }, [input, options]);

  const inputSize = byteSize(input);
  const outputSize = byteSize(result.output);

  return (
    <div className="tool">
      <ToolHeader title={t('tools.json.name')} description={t('tools.json.long')} />

      <Toolbar>
        <div className="field">
          <span className="field__label">{t('mode')}</span>
          <Segmented
            label={t('mode')}
            value={options.mode}
            onChange={set('mode')}
            options={[
              { value: 'pretty', label: t('pretty') },
              { value: 'compact', label: t('compact') },
            ]}
          />
        </div>
        <Select
          label={t('common.indent')}
          value={options.indent}
          onChange={set('indent')}
          disabled={options.mode === 'compact'}
          options={[
            { value: '2', label: t('common.spaces', { n: 2 }) },
            { value: '4', label: t('common.spaces', { n: 4 }) },
            { value: 'tab', label: 'Tab' },
          ]}
        />
        <div className="row" style={{ alignSelf: 'center', marginTop: 18 }}>
          <Checkbox label={t('sortKeys')} checked={options.sortKeys} onChange={set('sortKeys')} />
          <Checkbox label={t('escape')} checked={options.escape} onChange={set('escape')} />
        </div>
        <Spacer />
      </Toolbar>

      {result.error ? (
        <Notice tone="error">
          <strong>{t('invalid')}:</strong> {result.error.message}
          {result.error.line && <> — {t('at', result.error)}</>}
        </Notice>
      ) : (
        result.info && (
          <Notice tone="info">
            <strong>{t('valid')}</strong> — {t('summary', result.info)}
          </Notice>
        )
      )}

      <div className="split">
        <Pane
          title={t('common.input')}
          meta={formatBytes(inputSize)}
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
            highlight={highlightJson}
            placeholder={t('placeholder')}
            errorLine={result.error?.line}
            label={t('common.input')}
          />
        </Pane>
        <Pane
          title={options.mode === 'compact' ? t('common.minified') : t('common.output')}
          meta={
            result.output
              ? `${formatBytes(outputSize)}${inputSize ? ` (${Math.round((outputSize / inputSize) * 100)}%)` : ''}`
              : null
          }
          actions={
            <>
              <IconButton
                icon="download"
                label={t('common.download')}
                onClick={() => downloadText('dados.json', result.output, 'application/json')}
                disabled={!result.output}
              />
              <CopyButton value={result.output} iconOnly />
            </>
          }
        >
          <CodeEditor
            value={result.output}
            readOnly
            highlight={highlightJson}
            placeholder={t('outputPlaceholder')}
            label={t('common.output')}
          />
        </Pane>
      </div>
    </div>
  );
}
