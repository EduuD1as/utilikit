import { useId, useState } from 'react';
import { Icon } from './Icon.jsx';
import { useCopy } from '../context/ToastContext.jsx';
import { useT } from '../context/PreferencesContext.jsx';

export function ToolHeader({ title, description, children }) {
  return (
    <header className="tool-header">
      <div>
        <h1 className="tool-header__title">{title}</h1>
        {description && <p className="tool-header__desc">{description}</p>}
      </div>
      {children && <div className="tool-header__aside">{children}</div>}
    </header>
  );
}

export function Button({ variant = 'default', icon, children, className = '', size, ...rest }) {
  return (
    <button
      type="button"
      className={`btn btn--${variant}${size ? ` btn--${size}` : ''} ${className}`.trim()}
      {...rest}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}

export function IconButton({ icon, label, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`.trim()}
      aria-label={label}
      title={label}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}

export function CopyButton({ value, label, iconOnly = false, disabled, ...rest }) {
  const copy = useCopy();
  const t = useT();
  const [done, setDone] = useState(false);
  const text = label ?? t('common.copy');

  const onClick = async () => {
    if (await copy(value)) {
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    }
  };

  if (iconOnly) {
    return (
      <IconButton
        icon={done ? 'check' : 'copy'}
        label={text}
        onClick={onClick}
        disabled={disabled ?? !value}
        {...rest}
      />
    );
  }

  return (
    <Button icon={done ? 'check' : 'copy'} onClick={onClick} disabled={disabled ?? !value} {...rest}>
      {text}
    </Button>
  );
}

/** Rótulo + controle, empilhados. */
export function Field({ label, hint, children, className = '', htmlFor }) {
  return (
    <div className={`field ${className}`.trim()}>
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, options, id, className = '', ...rest }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const control = (
    <div className={`select ${className}`.trim()}>
      <select id={selectId} value={value} onChange={(event) => onChange(event.target.value)} {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
  if (!label) return control;
  return (
    <Field label={label} htmlFor={selectId}>
      {control}
    </Field>
  );
}

export function Input({ label, hint, id, className = '', suffix, ...rest }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const control = (
    <div className={`input${suffix ? ' input--suffix' : ''} ${className}`.trim()}>
      <input id={inputId} {...rest} />
      {suffix && <span className="input__suffix">{suffix}</span>}
    </div>
  );
  if (!label) return control;
  return (
    <Field label={label} hint={hint} htmlFor={inputId}>
      {control}
    </Field>
  );
}

/** Grupo de botões exclusivos (rádio visual). */
export function Segmented({ label, value, onChange, options, size }) {
  return (
    <div className={`segmented${size ? ` segmented--${size}` : ''}`} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={`segmented__item${value === option.value ? ' segmented__item--active' : ''}`}
          onClick={() => onChange(option.value)}
          disabled={option.disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label className={`checkbox${disabled ? ' checkbox--disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
      <span className="checkbox__box" aria-hidden="true">
        <Icon name="check" size={12} strokeWidth={2.6} />
      </span>
      <span>{label}</span>
    </label>
  );
}

export function Toolbar({ children, className = '' }) {
  return <div className={`toolbar ${className}`.trim()}>{children}</div>;
}

export function Spacer() {
  return <span className="spacer" />;
}

/** Painel com cabeçalho, no estilo de uma aba de editor. */
export function Pane({ title, meta, actions, children, className = '', status }) {
  return (
    <section className={`pane${status ? ` pane--${status}` : ''} ${className}`.trim()}>
      <header className="pane__head">
        <span className="pane__title">{title}</span>
        {meta && <span className="pane__meta">{meta}</span>}
        {actions && <span className="pane__actions">{actions}</span>}
      </header>
      <div className="pane__body">{children}</div>
    </section>
  );
}

export function Notice({ tone = 'info', children, action }) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={tone === 'error' ? 'alert' : 'shield'} />
      <div className="notice__body">{children}</div>
      {action}
    </div>
  );
}

export function Kbd({ children }) {
  return <kbd className="kbd">{children}</kbd>;
}

/** Linhas chave/valor com botão de copiar, comuns em ferramentas de conversão. */
export function KeyValueList({ rows }) {
  return (
    <dl className="kv">
      {rows.map((row) => (
        <div className="kv__row" key={row.label}>
          <dt>{row.label}</dt>
          <dd>
            <code>{row.value}</code>
            {row.copy !== false && <CopyButton value={row.value} iconOnly />}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

export function downloadText(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  downloadBlob(filename, blob);
}

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
