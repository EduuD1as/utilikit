const ICONS = {
  youtube: '📺',
  instagram: '📷',
  percent: '💯',
  scale: '⚖️',
  chart: '📊',
  currency: '💰',
  ruler: '📏',
  code: '💻',
  lock: '🔒',
  hash: '🔐',
  qr: '📱',
  text: '📝',
  database: '🗄️',
  clock: '⏰',
  file: '📄',
  game: '🎮',
  wheel: '🎡',
  activity: '📈',
};

export function ToolIcon({ name, className = '' }) {
  const content = ICONS[name] ?? ICONS.hash;

  return (
    <span className={className} aria-hidden="true">
      {content}
    </span>
  );
}
