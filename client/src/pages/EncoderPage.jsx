import { useMemo, useRef, useState } from 'react';
import { usePageT } from '../context/PreferencesContext.jsx';
import { CodeEditor } from '../components/CodeEditor.jsx';
import {
  Button,
  CopyButton,
  IconButton,
  Notice,
  Pane,
  Segmented,
  Spacer,
  ToolHeader,
  Toolbar,
} from '../components/ui.jsx';
import { bytesToBase64, decodeBase64, decodeUrl, encodeBase64, encodeUrl } from '../lib/encoding.js';
import { formatBytes } from '../lib/json.js';

const STRINGS = {
  pt: {
    format: 'Formato',
    direction: 'Operação',
    encode: 'Codificar',
    decode: 'Decodificar',
    urlSafe: 'Base64 URL',
    url: 'URL',
    placeholderEncode: 'Digite ou cole o texto',
    placeholderDecode: 'Cole o conteúdo codificado',
    invalidBase64: 'Isto não é Base64 válido. Confira se não há caracteres fora de A–Z, a–z, 0–9, +, /, - e _.',
    notText: 'O Base64 é válido, mas o conteúdo não é texto UTF-8 (provavelmente um arquivo binário).',
    invalidUrl: 'Sequência % inválida. Cada % precisa ser seguido de dois dígitos hexadecimais.',
    useOutput: 'Usar saída como entrada',
    file: 'Arquivo para Base64',
    dataUrl: 'Data URL',
    fileTooBig: 'Arquivo maior que 5 MB. Escolha um arquivo menor.',
  },
  en: {
    format: 'Format',
    direction: 'Operation',
    encode: 'Encode',
    decode: 'Decode',
    urlSafe: 'Base64 URL',
    url: 'URL',
    placeholderEncode: 'Type or paste text',
    placeholderDecode: 'Paste the encoded content',
    invalidBase64: 'This is not valid Base64. Check for characters outside A–Z, a–z, 0–9, +, /, - and _.',
    notText: 'The Base64 is valid, but the content is not UTF-8 text (probably a binary file).',
    invalidUrl: 'Invalid % sequence. Each % must be followed by two hex digits.',
    useOutput: 'Use output as input',
    file: 'File to Base64',
    dataUrl: 'Data URL',
    fileTooBig: 'File is larger than 5 MB. Choose a smaller file.',
  },
};

const MAX_FILE = 5 * 1024 * 1024;

export default function EncoderPage() {
  const t = usePageT(STRINGS);
  const [format, setFormat] = useState('base64');
  const [direction, setDirection] = useState('encode');
  const [input, setInput] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    if (fileInfo) return { output: fileInfo.output, error: null };
    if (!input) return { output: '', error: null };
    try {
      if (format === 'url') {
        return { output: direction === 'encode' ? encodeUrl(input) : decodeUrl(input), error: null };
      }
      if (direction === 'encode') {
        return { output: encodeBase64(input, { urlSafe: format === 'base64url' }), error: null };
      }
      return { output: decodeBase64(input), error: null };
    } catch (error) {
      if (format === 'url') return { output: '', error: t('invalidUrl') };
      return { output: '', error: error.message === 'invalid-base64' ? t('invalidBase64') : t('notText') };
    }
  }, [input, format, direction, fileInfo, t]);

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE) {
      setFileInfo({ output: '', name: file.name, error: t('fileTooBig') });
      return;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const b64 = bytesToBase64(bytes);
    setDirection('encode');
    setFormat('base64');
    setInput('');
    setFileInfo({
      name: file.name,
      size: file.size,
      output: `data:${file.type || 'application/octet-stream'};base64,${b64}`,
    });
  };

  const changeInput = (value) => {
    setFileInfo(null);
    setInput(value);
  };

  const useOutput = () => {
    setFileInfo(null);
    setInput(result.output);
    setDirection((d) => (d === 'encode' ? 'decode' : 'encode'));
  };

  return (
    <div className="tool">
      <ToolHeader title={t('tools.encoder.name')} description={t('tools.encoder.long')} />

      <Toolbar>
        <div className="field">
          <span className="field__label">{t('format')}</span>
          <Segmented
            label={t('format')}
            value={format}
            onChange={(v) => {
              setFileInfo(null);
              setFormat(v);
            }}
            options={[
              { value: 'base64', label: 'Base64' },
              { value: 'base64url', label: t('urlSafe') },
              { value: 'url', label: t('url') },
            ]}
          />
        </div>
        <div className="field">
          <span className="field__label">{t('direction')}</span>
          <Segmented
            label={t('direction')}
            value={direction}
            onChange={(v) => {
              setFileInfo(null);
              setDirection(v);
            }}
            options={[
              { value: 'encode', label: t('encode') },
              { value: 'decode', label: t('decode') },
            ]}
          />
        </div>
        <Spacer />
        <div className="toolbar__group">
          <input ref={fileRef} type="file" hidden onChange={onFile} />
          <Button icon="upload" onClick={() => fileRef.current?.click()}>
            {t('file')}
          </Button>
          <Button icon="swap" onClick={useOutput} disabled={!result.output || Boolean(fileInfo)}>
            {t('useOutput')}
          </Button>
        </div>
      </Toolbar>

      {(result.error || fileInfo?.error) && <Notice tone="error">{result.error || fileInfo.error}</Notice>}

      <div className="split">
        <Pane
          title={fileInfo ? fileInfo.name : t('common.input')}
          meta={fileInfo?.size ? formatBytes(fileInfo.size) : `${input.length} chars`}
          status={result.error ? 'error' : undefined}
          actions={
            <IconButton
              icon="trash"
              label={t('common.clear')}
              onClick={() => changeInput('')}
              disabled={!input && !fileInfo}
            />
          }
        >
          <CodeEditor
            value={input}
            onChange={changeInput}
            wrap
            placeholder={direction === 'encode' ? t('placeholderEncode') : t('placeholderDecode')}
            label={t('common.input')}
          />
        </Pane>
        <Pane
          title={fileInfo ? t('dataUrl') : t('common.output')}
          meta={`${result.output.length} chars`}
          actions={<CopyButton value={result.output} iconOnly />}
        >
          <CodeEditor value={result.output} readOnly wrap label={t('common.output')} />
        </Pane>
      </div>
    </div>
  );
}
