import { useEffect, useRef, useState } from 'react';
import { usePageT } from '../context/PreferencesContext.jsx';
import {
  Button,
  Checkbox,
  CopyButton,
  Input,
  KeyValueList,
  Pane,
  Segmented,
  ToolHeader,
} from '../components/ui.jsx';
import { randomString, uuidV4, uuidV7 } from '../lib/random.js';
import { HASH_ALGORITHMS, hashAll } from '../lib/hash.js';
import { formatBytes } from '../lib/json.js';

const STRINGS = {
  pt: {
    uuid: 'UUID',
    version: 'Versão',
    v7hint: 'v7 começa pelo horário de criação, então fica em ordem quando ordenado — bom para chaves de banco.',
    quantity: 'Quantidade',
    uppercase: 'Maiúsculas',
    hyphens: 'Com hífens',
    randomString: 'String aleatória',
    length: 'Tamanho',
    lower: 'a–z',
    upper: 'A–Z',
    digits: '0–9',
    symbols: 'Símbolos',
    pickOne: 'Escolha pelo menos um conjunto de caracteres.',
    hash: 'Hash',
    hashText: 'Texto',
    hashFile: 'Arquivo',
    hashPlaceholder: 'Digite o texto para calcular os hashes',
    chooseFile: 'Escolher arquivo',
    md5Note: 'MD5 e SHA-1 servem para checar integridade, não para guardar senhas.',
    copyAll: 'Copiar todos',
  },
  en: {
    uuid: 'UUID',
    version: 'Version',
    v7hint: 'v7 starts with the creation time, so it sorts in order — good for database keys.',
    quantity: 'Quantity',
    uppercase: 'Uppercase',
    hyphens: 'Hyphens',
    randomString: 'Random string',
    length: 'Length',
    lower: 'a–z',
    upper: 'A–Z',
    digits: '0–9',
    symbols: 'Symbols',
    pickOne: 'Pick at least one character set.',
    hash: 'Hash',
    hashText: 'Text',
    hashFile: 'File',
    hashPlaceholder: 'Type text to compute hashes',
    chooseFile: 'Choose file',
    md5Note: 'MD5 and SHA-1 are fine for integrity checks, not for storing passwords.',
    copyAll: 'Copy all',
  },
};

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
};

function UuidSection({ t }) {
  const [version, setVersion] = useState('v4');
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [list, setList] = useState([]);

  const generate = () => {
    const make = version === 'v7' ? uuidV7 : uuidV4;
    setList(Array.from({ length: count }, () => make()));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(generate, [version, count]);

  const shown = list.map((id) => {
    let out = hyphens ? id : id.replace(/-/g, '');
    if (upper) out = out.toUpperCase();
    return out;
  });

  return (
    <Pane
      title={t('uuid')}
      actions={
        <>
          <Button size="sm" variant="ghost" icon="refresh" onClick={generate}>
            {t('common.generate')}
          </Button>
          <CopyButton value={shown.join('\n')} iconOnly label={t('copyAll')} />
        </>
      }
    >
      <div className="pane__pad stack">
        <div className="row">
          <div className="field">
            <span className="field__label">{t('version')}</span>
            <Segmented
              label={t('version')}
              value={version}
              onChange={setVersion}
              options={[
                { value: 'v4', label: 'v4' },
                { value: 'v7', label: 'v7' },
              ]}
            />
          </div>
          <Input
            label={t('quantity')}
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(event) => setCount(Math.min(100, Math.max(1, Number(event.target.value) || 1)))}
            style={{ width: 90 }}
          />
          <div className="row" style={{ paddingBottom: 7 }}>
            <Checkbox label={t('uppercase')} checked={upper} onChange={setUpper} />
            <Checkbox label={t('hyphens')} checked={hyphens} onChange={setHyphens} />
          </div>
        </div>
        {version === 'v7' && <p className="field__hint">{t('v7hint')}</p>}
        <ul className="id-list">
          {shown.map((id, index) => (
            <li key={`${index}-${id}`}>
              <code>{id}</code>
              <CopyButton value={id} iconOnly />
            </li>
          ))}
        </ul>
      </div>
    </Pane>
  );
}

function StringSection({ t }) {
  const [length, setLength] = useState(24);
  const [sets, setSets] = useState({ lower: true, upper: true, digits: true, symbols: false });
  const [value, setValue] = useState('');

  const alphabet = Object.entries(sets)
    .filter(([, on]) => on)
    .map(([key]) => SETS[key])
    .join('');

  const generate = () => setValue(alphabet ? randomString(length, alphabet) : '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(generate, [length, alphabet]);

  return (
    <Pane
      title={t('randomString')}
      actions={
        <Button size="sm" variant="ghost" icon="refresh" onClick={generate} disabled={!alphabet}>
          {t('common.generate')}
        </Button>
      }
    >
      <div className="pane__pad stack">
        <div className="field">
          <span className="field__label">
            {t('length')}: <b className="mono">{length}</b>
          </span>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
            aria-label={t('length')}
          />
        </div>
        <div className="row">
          {Object.keys(SETS).map((key) => (
            <Checkbox
              key={key}
              label={t(key)}
              checked={sets[key]}
              onChange={(on) => setSets((prev) => ({ ...prev, [key]: on }))}
            />
          ))}
        </div>
        {alphabet ? (
          <div className="output-box">
            <code>{value}</code>
            <CopyButton value={value} iconOnly />
          </div>
        ) : (
          <p className="field__hint">{t('pickOne')}</p>
        )}
      </div>
    </Pane>
  );
}

function HashSection({ t }) {
  const [source, setSource] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [hashes, setHashes] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      let bytes;
      if (source === 'file') {
        if (!file) return setHashes(null);
        bytes = new Uint8Array(await file.arrayBuffer());
      } else {
        bytes = new TextEncoder().encode(text);
      }
      const result = await hashAll(bytes);
      if (!cancelled) setHashes(result);
    };
    const id = setTimeout(run, 120);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [text, file, source]);

  return (
    <Pane title={t('hash')}>
      <div className="pane__pad stack">
        <Segmented
          label={t('hash')}
          value={source}
          onChange={setSource}
          options={[
            { value: 'text', label: t('hashText') },
            { value: 'file', label: t('hashFile') },
          ]}
        />
        {source === 'text' ? (
          <textarea
            className="textarea"
            rows={4}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('hashPlaceholder')}
            aria-label={t('hashText')}
            spellCheck={false}
          />
        ) : (
          <div className="row" style={{ alignItems: 'center' }}>
            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <Button icon="upload" onClick={() => fileRef.current?.click()}>
              {t('chooseFile')}
            </Button>
            {file && (
              <span className="muted mono">
                {file.name} · {formatBytes(file.size)}
              </span>
            )}
          </div>
        )}
        {hashes && (
          <KeyValueList rows={HASH_ALGORITHMS.map((algo) => ({ label: algo.label, value: hashes[algo.id] }))} />
        )}
        <p className="field__hint">{t('md5Note')}</p>
      </div>
    </Pane>
  );
}

export default function IdHashPage() {
  const t = usePageT(STRINGS);
  return (
    <div className="tool">
      <ToolHeader title={t('tools.hash.name')} description={t('tools.hash.long')} />
      <div className="grid-2 grid-2--top">
        <div className="stack">
          <UuidSection t={t} />
          <StringSection t={t} />
        </div>
        <HashSection t={t} />
      </div>
    </div>
  );
}
