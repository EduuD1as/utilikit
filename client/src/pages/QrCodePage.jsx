import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { usePageT } from '../context/PreferencesContext.jsx';
import { Button, Checkbox, Field, Input, Notice, Pane, Segmented, Select, ToolHeader } from '../components/ui.jsx';
import { downloadBlob, downloadText } from '../components/ui.jsx';

const STRINGS = {
  pt: {
    content: 'Conteúdo',
    text: 'Texto ou link',
    wifi: 'Wi-Fi',
    textLabel: 'Texto ou URL',
    textPlaceholder: 'https://exemplo.com.br',
    ssid: 'Nome da rede (SSID)',
    password: 'Senha',
    security: 'Segurança',
    open: 'Sem senha',
    hidden: 'Rede oculta',
    appearance: 'Aparência',
    ecc: 'Correção de erros',
    eccL: 'Baixa (7%)',
    eccM: 'Média (15%)',
    eccQ: 'Alta (25%)',
    eccH: 'Máxima (30%)',
    size: 'Tamanho do PNG',
    margin: 'Margem',
    foreground: 'Cor',
    background: 'Fundo',
    preview: 'Prévia',
    empty: 'Digite algo para gerar o QR Code.',
    tooLong: 'Conteúdo longo demais para um QR Code. Reduza o texto ou baixe a correção de erros.',
    contrast: 'Pouco contraste entre cor e fundo. Alguns leitores podem não reconhecer o código.',
  },
  en: {
    content: 'Content',
    text: 'Text or link',
    wifi: 'Wi-Fi',
    textLabel: 'Text or URL',
    textPlaceholder: 'https://example.com',
    ssid: 'Network name (SSID)',
    password: 'Password',
    security: 'Security',
    open: 'No password',
    hidden: 'Hidden network',
    appearance: 'Appearance',
    ecc: 'Error correction',
    eccL: 'Low (7%)',
    eccM: 'Medium (15%)',
    eccQ: 'High (25%)',
    eccH: 'Maximum (30%)',
    size: 'PNG size',
    margin: 'Margin',
    foreground: 'Color',
    background: 'Background',
    preview: 'Preview',
    empty: 'Type something to generate the QR code.',
    tooLong: 'Content is too long for a QR code. Shorten it or lower error correction.',
    contrast: 'Low contrast between color and background. Some scanners may fail to read it.',
  },
};

const escapeWifi = (value) => value.replace(/([\\;,:"])/g, '\\$1');

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export default function QrCodePage() {
  const t = usePageT(STRINGS);
  const [kind, setKind] = useState('text');
  const [text, setText] = useState('https://utilikit.com.br');
  const [wifi, setWifi] = useState({ ssid: '', password: '', security: 'WPA', hidden: false });
  const [ecc, setEcc] = useState('M');
  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(2);
  const [fg, setFg] = useState('#111111');
  const [bg, setBg] = useState('#ffffff');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  const payload = useMemo(() => {
    if (kind === 'wifi') {
      if (!wifi.ssid) return '';
      const pass = wifi.security === 'nopass' ? '' : `P:${escapeWifi(wifi.password)};`;
      return `WIFI:T:${wifi.security};S:${escapeWifi(wifi.ssid)};${pass}${wifi.hidden ? 'H:true;' : ''};`;
    }
    return text;
  }, [kind, text, wifi]);

  const options = useMemo(
    () => ({ errorCorrectionLevel: ecc, margin, color: { dark: fg, light: bg } }),
    [ecc, margin, fg, bg]
  );

  useEffect(() => {
    if (!payload) {
      setSvg('');
      setError(null);
      return;
    }
    let cancelled = false;
    QRCode.toString(payload, { ...options, type: 'svg' })
      .then((out) => {
        if (cancelled) return;
        setSvg(out);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setSvg('');
        setError(t('tooLong'));
      });
    return () => {
      cancelled = true;
    };
  }, [payload, options, t]);

  const lowContrast = (() => {
    const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
    return (a + 0.05) / (b + 0.05) < 3;
  })();

  const downloadPng = async () => {
    const url = await QRCode.toDataURL(payload, { ...options, width: size });
    const blob = await (await fetch(url)).blob();
    downloadBlob('qrcode.png', blob);
  };

  return (
    <div className="tool">
      <ToolHeader title={t('tools.qr.name')} description={t('tools.qr.long')} />

      <div className="qr-layout">
        <div className="stack">
          <Pane title={t('content')}>
            <div className="pane__pad stack">
              <Segmented
                label={t('content')}
                value={kind}
                onChange={setKind}
                options={[
                  { value: 'text', label: t('text') },
                  { value: 'wifi', label: t('wifi') },
                ]}
              />
              {kind === 'text' ? (
                <Field label={t('textLabel')}>
                  <textarea
                    className="textarea"
                    rows={4}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder={t('textPlaceholder')}
                    spellCheck={false}
                  />
                </Field>
              ) : (
                <div className="stack">
                  <Input
                    label={t('ssid')}
                    value={wifi.ssid}
                    onChange={(event) => setWifi({ ...wifi, ssid: event.target.value })}
                  />
                  <div className="grid-2">
                    <Select
                      label={t('security')}
                      value={wifi.security}
                      onChange={(security) => setWifi({ ...wifi, security })}
                      options={[
                        { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
                        { value: 'WEP', label: 'WEP' },
                        { value: 'nopass', label: t('open') },
                      ]}
                    />
                    <Input
                      label={t('password')}
                      value={wifi.password}
                      disabled={wifi.security === 'nopass'}
                      onChange={(event) => setWifi({ ...wifi, password: event.target.value })}
                    />
                  </div>
                  <Checkbox
                    label={t('hidden')}
                    checked={wifi.hidden}
                    onChange={(hidden) => setWifi({ ...wifi, hidden })}
                  />
                </div>
              )}
            </div>
          </Pane>

          <Pane title={t('appearance')}>
            <div className="pane__pad grid-2">
              <Select
                label={t('ecc')}
                value={ecc}
                onChange={setEcc}
                options={['L', 'M', 'Q', 'H'].map((level) => ({ value: level, label: t(`ecc${level}`) }))}
              />
              <Select
                label={t('size')}
                value={String(size)}
                onChange={(v) => setSize(Number(v))}
                options={[256, 512, 1024, 2048].map((n) => ({ value: String(n), label: `${n} × ${n}px` }))}
              />
              <Select
                label={t('margin')}
                value={String(margin)}
                onChange={(v) => setMargin(Number(v))}
                options={[0, 1, 2, 4, 6].map((n) => ({ value: String(n), label: String(n) }))}
              />
              <div className="row">
                <Field label={t('foreground')}>
                  <input type="color" className="color" value={fg} onChange={(event) => setFg(event.target.value)} />
                </Field>
                <Field label={t('background')}>
                  <input type="color" className="color" value={bg} onChange={(event) => setBg(event.target.value)} />
                </Field>
              </div>
            </div>
          </Pane>
        </div>

        <Pane title={t('preview')} className="qr-preview">
          <div className="pane__pad stack qr-preview__body">
            {svg ? (
              <div className="qr-preview__img" style={{ background: bg }} dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
              <div className="qr-preview__empty muted">{error ? '' : t('empty')}</div>
            )}
            {error && <Notice tone="error">{error}</Notice>}
            {svg && lowContrast && <Notice tone="info">{t('contrast')}</Notice>}
            <div className="row">
              <Button variant="primary" icon="download" onClick={downloadPng} disabled={!svg}>
                PNG
              </Button>
              <Button icon="download" onClick={() => downloadText('qrcode.svg', svg, 'image/svg+xml')} disabled={!svg}>
                SVG
              </Button>
            </div>
          </div>
        </Pane>
      </div>
    </div>
  );
}
