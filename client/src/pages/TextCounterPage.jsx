import { useDeferredValue, useMemo, useState } from 'react';
import { usePageT, usePreferences } from '../context/PreferencesContext.jsx';
import { Button, CopyButton, IconButton, Pane, Stat, ToolHeader } from '../components/ui.jsx';

const STRINGS = {
  pt: {
    placeholder: 'Digite ou cole seu texto',
    characters: 'Caracteres',
    noSpaces: 'Sem espaços',
    words: 'Palavras',
    lines: 'Linhas',
    paragraphs: 'Parágrafos',
    sentences: 'Frases',
    bytes: 'Bytes (UTF-8)',
    reading: 'Tempo de leitura',
    transform: 'Transformar',
    upper: 'MAIÚSCULAS',
    lower: 'minúsculas',
    title: 'Primeira Maiúscula',
    trim: 'Remover espaços extras',
    min: '{n} min',
    sec: '{n} s',
    topWords: 'Palavras mais usadas',
  },
  en: {
    placeholder: 'Type or paste your text',
    characters: 'Characters',
    noSpaces: 'No spaces',
    words: 'Words',
    lines: 'Lines',
    paragraphs: 'Paragraphs',
    sentences: 'Sentences',
    bytes: 'Bytes (UTF-8)',
    reading: 'Reading time',
    transform: 'Transform',
    upper: 'UPPERCASE',
    lower: 'lowercase',
    title: 'Title Case',
    trim: 'Remove extra spaces',
    min: '{n} min',
    sec: '{n} s',
    topWords: 'Most used words',
  },
};

const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

function countGraphemes(text) {
  if (!segmenter) return Array.from(text).length;
  let n = 0;
  for (const _ of segmenter.segment(text)) n += 1;
  return n;
}

export default function TextCounterPage() {
  const t = usePageT(STRINGS);
  const { locale } = usePreferences();
  const [text, setText] = useState('');
  const deferred = useDeferredValue(text);

  const stats = useMemo(() => {
    const s = deferred;
    const trimmed = s.trim();
    const wordList = trimmed ? trimmed.split(/\s+/) : [];
    const freq = new Map();
    for (const raw of wordList) {
      const word = raw.toLocaleLowerCase(locale).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
      if (word.length > 2) freq.set(word, (freq.get(word) ?? 0) + 1);
    }
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const seconds = Math.round((wordList.length / 220) * 60);
    return {
      characters: countGraphemes(s),
      noSpaces: countGraphemes(s.replace(/\s/g, '')),
      words: wordList.length,
      lines: s ? s.split('\n').length : 0,
      paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0,
      sentences: trimmed ? (trimmed.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? []).filter((x) => x.trim()).length : 0,
      bytes: new TextEncoder().encode(s).length,
      reading: seconds < 60 ? t('sec', { n: seconds }) : t('min', { n: Math.round(seconds / 60) }),
      top,
    };
  }, [deferred, locale, t]);

  const nf = new Intl.NumberFormat(locale);

  const transform = (kind) => {
    if (kind === 'upper') setText(text.toLocaleUpperCase(locale));
    if (kind === 'lower') setText(text.toLocaleLowerCase(locale));
    if (kind === 'title')
      setText(text.toLocaleLowerCase(locale).replace(/(^|\s)(\p{L})/gu, (m, sp, ch) => sp + ch.toLocaleUpperCase(locale)));
    if (kind === 'trim')
      setText(
        text
          .split('\n')
          .map((line) => line.replace(/[ \t]+/g, ' ').trim())
          .join('\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      );
  };

  return (
    <div className="tool">
      <ToolHeader title={t('tools.text.name')} description={t('tools.text.long')} />

      <div className="stats">
        <Stat label={t('characters')} value={nf.format(stats.characters)} />
        <Stat label={t('noSpaces')} value={nf.format(stats.noSpaces)} />
        <Stat label={t('words')} value={nf.format(stats.words)} />
        <Stat label={t('sentences')} value={nf.format(stats.sentences)} />
        <Stat label={t('lines')} value={nf.format(stats.lines)} />
        <Stat label={t('paragraphs')} value={nf.format(stats.paragraphs)} />
        <Stat label={t('bytes')} value={nf.format(stats.bytes)} />
        <Stat label={t('reading')} value={stats.reading} />
      </div>

      <Pane
        title={t('common.input')}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => transform('upper')} disabled={!text}>
              {t('upper')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => transform('lower')} disabled={!text}>
              {t('lower')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => transform('title')} disabled={!text}>
              {t('title')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => transform('trim')} disabled={!text}>
              {t('trim')}
            </Button>
            <CopyButton value={text} iconOnly />
            <IconButton icon="trash" label={t('common.clear')} onClick={() => setText('')} disabled={!text} />
          </>
        }
      >
        <textarea
          className="plain-area"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('placeholder')}
          aria-label={t('common.input')}
        />
      </Pane>

      {stats.top.length > 0 && (
        <div className="chips" aria-label={t('topWords')}>
          <span className="muted chips__label">{t('topWords')}</span>
          {stats.top.map(([word, count]) => (
            <span className="chip" key={word}>
              {word} <b>{count}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
