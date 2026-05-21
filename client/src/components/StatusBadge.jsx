const LABELS = {
  idle: 'Aguardando',
  connecting: 'Conectando…',
  live: 'Ao vivo',
  reconnecting: 'Reconectando…',
};

export function StatusBadge({ status }) {
  if (status === 'idle') return null;

  return (
    <span className={`badge badge--${status}`}>
      <span className="badge__dot" aria-hidden="true" />
      {LABELS[status] ?? status}
    </span>
  );
}
