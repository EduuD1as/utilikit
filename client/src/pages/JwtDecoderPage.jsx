import { useEffect, useMemo, useState } from 'react';
import { usePageT, usePreferences } from '../context/PreferencesContext.jsx';
import { CodeEditor } from '../components/CodeEditor.jsx';
import { Button, CopyButton, IconButton, KeyValueList, Notice, Pane, ToolHeader } from '../components/ui.jsx';
import { decodeBase64 } from '../lib/encoding.js';
import { highlightJson } from '../lib/highlight.js';

const STRINGS = {
  pt: {
    token: 'Token',
    placeholder: 'Cole o JWT (eyJ...)',
    header: 'Header',
    payload: 'Payload',
    claims: 'Datas e status',
    invalidParts: 'Um JWT tem três partes separadas por ponto (header.payload.assinatura).',
    invalidPart: 'Não foi possível decodificar o {part}. Confira se o token foi copiado inteiro.',
    expired: 'Expirado {when}',
    valid: 'Válido — expira {when}',
    notYet: 'Ainda não válido — começa {when}',
    noExp: 'Sem data de expiração (exp)',
    signature: 'A assinatura não é verificada: isto só decodifica o conteúdo. Nunca confie em um token sem validá-lo no servidor.',
    issuedAt: 'Emitido em (iat)',
    notBefore: 'Válido a partir de (nbf)',
    expiresAt: 'Expira em (exp)',
    status: 'Status',
    algorithm: 'Algoritmo',
  },
  en: {
    token: 'Token',
    placeholder: 'Paste the JWT (eyJ...)',
    header: 'Header',
    payload: 'Payload',
    claims: 'Dates and status',
    invalidParts: 'A JWT has three parts separated by dots (header.payload.signature).',
    invalidPart: 'Could not decode the {part}. Make sure you copied the whole token.',
    expired: 'Expired {when}',
    valid: 'Valid — expires {when}',
    notYet: 'Not valid yet — starts {when}',
    noExp: 'No expiry date (exp)',
    signature: 'The signature is not verified: this only decodes the content. Never trust a token without validating it on the server.',
    issuedAt: 'Issued at (iat)',
    notBefore: 'Not before (nbf)',
    expiresAt: 'Expires at (exp)',
    status: 'Status',
    algorithm: 'Algorithm',
  },
};

// Token de exemplo sem valor real (assinatura fictícia).
const EXAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldiBVdGlsaUtpdCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MzkwMDAwMCwiZXhwIjoxOTIxNjY2NDAwfQ.5mhBHqs5_DTLdINd9p5m7ZJ6XD0Xc55kIaCRY5r6HRA';

function decodePart(part) {
  return JSON.parse(decodeBase64(part));
}

function relative(seconds, locale) {
  const diff = seconds - Date.now() / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 60) return rtf.format(Math.round(diff / 86400), 'day');
  if (abs < 86400 * 730) return rtf.format(Math.round(diff / (86400 * 30)), 'month');
  return rtf.format(Math.round(diff / (86400 * 365)), 'year');
}

export default function JwtDecoderPage() {
  const t = usePageT(STRINGS);
  const { locale } = usePreferences();
  const [token, setToken] = useState('');
  const [, setTick] = useState(0);

  // Reavalia o status (expirado/válido) a cada 30 s.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const decoded = useMemo(() => {
    const clean = token.trim().replace(/^Bearer\s+/i, '');
    if (!clean) return null;
    const parts = clean.split('.');
    if (parts.length !== 3) return { error: t('invalidParts') };
    let header;
    let payload;
    try {
      header = decodePart(parts[0]);
    } catch {
      return { error: t('invalidPart', { part: 'header' }) };
    }
    try {
      payload = decodePart(parts[1]);
    } catch {
      return { error: t('invalidPart', { part: 'payload' }) };
    }
    return { header, payload, signature: parts[2] };
  }, [token, t]);

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' });
  const fmtClaim = (value) =>
    typeof value === 'number' ? `${dateFmt.format(new Date(value * 1000))} (${relative(value, locale)})` : '—';

  let status = null;
  if (decoded?.payload) {
    const now = Date.now() / 1000;
    const { exp, nbf } = decoded.payload;
    if (typeof nbf === 'number' && nbf > now) status = { tone: 'error', text: t('notYet', { when: relative(nbf, locale) }) };
    else if (typeof exp === 'number' && exp < now) status = { tone: 'error', text: t('expired', { when: relative(exp, locale) }) };
    else if (typeof exp === 'number') status = { tone: 'ok', text: t('valid', { when: relative(exp, locale) }) };
    else status = { tone: 'info', text: t('noExp') };
  }

  const headerJson = decoded?.header ? JSON.stringify(decoded.header, null, 2) : '';
  const payloadJson = decoded?.payload ? JSON.stringify(decoded.payload, null, 2) : '';

  return (
    <div className="tool">
      <ToolHeader title={t('tools.jwt.name')} description={t('tools.jwt.long')} />

      <Pane
        title={t('token')}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => setToken(EXAMPLE)}>
              {t('common.example')}
            </Button>
            <IconButton icon="trash" label={t('common.clear')} onClick={() => setToken('')} disabled={!token} />
          </>
        }
        status={decoded?.error ? 'error' : undefined}
      >
        <textarea
          className="textarea jwt-input"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder={t('placeholder')}
          spellCheck={false}
          aria-label={t('token')}
        />
      </Pane>

      {decoded?.error && <Notice tone="error">{decoded.error}</Notice>}

      {decoded?.payload && (
        <>
          <div className={`jwt-status jwt-status--${status.tone}`}>
            <span className="jwt-status__dot" aria-hidden="true" />
            {status.text}
          </div>

          <div className="split split--auto">
            <Pane title={t('header')} actions={<CopyButton value={headerJson} iconOnly />}>
              <CodeEditor value={headerJson} readOnly highlight={highlightJson} label={t('header')} />
            </Pane>
            <Pane title={t('payload')} actions={<CopyButton value={payloadJson} iconOnly />}>
              <CodeEditor value={payloadJson} readOnly highlight={highlightJson} label={t('payload')} />
            </Pane>
          </div>

          <Pane title={t('claims')}>
            <div className="pane__pad">
              <KeyValueList
                rows={[
                  { label: t('algorithm'), value: String(decoded.header.alg ?? '—'), copy: false },
                  { label: t('issuedAt'), value: fmtClaim(decoded.payload.iat), copy: false },
                  { label: t('notBefore'), value: fmtClaim(decoded.payload.nbf), copy: false },
                  { label: t('expiresAt'), value: fmtClaim(decoded.payload.exp), copy: false },
                ]}
              />
            </div>
          </Pane>

          <Notice tone="info">{t('signature')}</Notice>
        </>
      )}
    </div>
  );
}
