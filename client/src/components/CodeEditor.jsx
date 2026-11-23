import { forwardRef, useDeferredValue, useMemo, useRef } from 'react';

export function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Editor de código leve: textarea transparente sobre um <pre> com realce de
 * sintaxe, mais uma coluna de números de linha. Sem quebra de linha, para que
 * números, realce e cursor fiquem sempre alinhados.
 */
export const CodeEditor = forwardRef(function CodeEditor(
  { value, onChange, highlight, readOnly = false, placeholder, errorLine, label, onKeyDown, wrap = false },
  ref
) {
  const gutterRef = useRef(null);
  const preRef = useRef(null);
  const deferred = useDeferredValue(value);

  const html = useMemo(() => {
    const source = deferred.endsWith('\n') ? `${deferred} ` : deferred;
    return highlight ? highlight(source) : escapeHtml(source);
  }, [deferred, highlight]);

  const lineCount = useMemo(() => Math.max(1, value.split('\n').length), [value]);

  const onScroll = (event) => {
    const { scrollTop, scrollLeft } = event.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  };

  return (
    <div className={`editor${wrap ? ' editor--wrap' : ''}${readOnly ? ' editor--readonly' : ''}`}>
      {!wrap && (
        <div className="editor__gutter" ref={gutterRef} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i} className={errorLine === i + 1 ? 'editor__line--error' : undefined}>
              {i + 1}
            </span>
          ))}
        </div>
      )}
      <div className="editor__surface">
        <pre className="editor__highlight hljs" ref={preRef} aria-hidden="true">
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
        <textarea
          ref={ref}
          className="editor__input"
          value={value}
          onChange={readOnly ? undefined : (event) => onChange(event.target.value)}
          onScroll={onScroll}
          onKeyDown={(event) => {
            if (!readOnly && event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
              // Tab insere dois espaços em vez de sair do campo. Esc + Tab continua navegando.
              event.preventDefault();
              const el = event.currentTarget;
              const { selectionStart, selectionEnd } = el;
              const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
              onChange(next);
              requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = selectionStart + 2;
              });
            }
            onKeyDown?.(event);
          }}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap={wrap ? 'soft' : 'off'}
          aria-label={label}
        />
      </div>
    </div>
  );
});
