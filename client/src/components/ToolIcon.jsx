const ICONS = {
  youtube: (
    <path
      fill="currentColor"
      d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8ZM9.6 15.5V8.5l6.3 3.5-6.3 3.5Z"
    />
  ),
  instagram: (
    <path
      fill="currentColor"
      d="M12 2.2c2.7 0 3 .01 4 .06 1 .05 1.5.2 2 .4.6.2 1 .5 1.5 1 .5.5.8.9 1 1.5.2.5.35 1 .4 2 .05 1 .06 1.3.06 4s-.01 3-.06 4c-.05 1-.2 1.5-.4 2-.2.6-.5 1-1 1.5-.5.5-.9.8-1.5 1-.5.2-1 .35-2 .4-1 .05-1.3.06-4 .06s-3-.01-4-.06c-1-.05-1.5-.2-2-.4-.6-.2-1-.5-1.5-1-.5-.5-.8-.9-1-1.5-.2-.5-.35-1-.4-2C2.2 15 2.2 14.7 2.2 12s.01-3 .06-4c.05-1 .2-1.5.4-2 .2-.6.5-1 1-1.5.5-.5.9-.8 1.5-1 .5-.2 1-.35 2-.4 1-.05 1.3-.06 4-.06Zm0 1.8c-2.6 0-2.9.01-3.9.06-.9.04-1.4.2-1.7.3-.4.2-.7.4-1 .7-.3.3-.5.6-.7 1-.1.3-.26.8-.3 1.7-.04 1-.05 1.3-.05 3.9s.01 2.9.05 3.9c.04.9.2 1.4.3 1.7.2.4.4.7.7 1 .3.3.6.5 1 .7.3.1.8.26 1.7.3 1 .04 1.3.05 3.9.05s2.9-.01 3.9-.05c.9-.04 1.4-.2 1.7-.3.4-.2.7-.4 1-.7.3-.3.5-.6.7-1 .1-.3.26-.8.3-1.7.04-1 .05-1.3.05-3.9s-.01-2.9-.05-3.9c-.04-.9-.2-1.4-.3-1.7-.2-.4-.4-.7-.7-1-.3-.3-.6-.5-1-.7-.3-.1-.8-.26-1.7-.3-1-.04-1.3-.05-3.9-.05Zm0 3.2a5.8 5.8 0 1 1 0 11.6 5.8 5.8 0 0 1 0-11.6Zm0 1.8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm6.4-4.2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Z"
    />
  ),
  percent: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M19 5 5 19M6.5 6.5a2 2 0 1 1 0 2.8 2 2 0 0 1 0-2.8Zm11 11a2 2 0 1 1 0 2.8 2 2 0 0 1 0-2.8Z"
    />
  ),
  scale: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M12 3v18M5 8h14M7 14h10"
    />
  ),
  chart: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M4 19V5M10 19V9M16 19v-6M22 19V3"
    />
  ),
  currency: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M12 3v18M8 7.5c0-1.7 1.8-3 4-3s4 1.3 4 3-1.8 3-4 3-4 1.3-4 3 1.8 3 4 3 4 1.3 4 3-1.8 3-4 3-4-1.3-4-3"
    />
  ),
  ruler: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M4 8h16M6 12h2M10 12h2M14 12h2M18 12h2M6 16h2M10 16h2M14 16h2"
    />
  ),
  code: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="m8 9-3 3 3 3m8-6 3 3-3 3M14 5l-4 14"
    />
  ),
  lock: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11Z"
    />
  ),
  hash: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M10 4 8 20M16 4l-2 16M4 9h16M3 15h16"
    />
  ),
  qr: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm14 0h2v2h-2v-2Zm-4 4h2v2h-2v-2Zm4-4h2v2h-2v-2Z"
    />
  ),
  text: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M4 6h16M4 12h10M4 18h14"
    />
  ),
  database: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M4 6c0 2.2 3.6 4 8 4s8-1.8 8-4-3.6-4-8-4-8 1.8-8 4Zm0 6c0 2.2 3.6 4 8 4s8-1.8 8-4M4 18c0 2.2 3.6 4 8 4s8-1.8 8-4"
    />
  ),
  clock: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10ZM12 6v6l4 2"
    />
  ),
  file: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM14 2v6h6M16 13H8M16 17H8M10 9H8"
    />
  ),
};

export function ToolIcon({ name, className = '' }) {
  const content = ICONS[name] ?? ICONS.hash;
  const filled = name === 'youtube' || name === 'instagram';

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? undefined : 'none'}
    >
      {content}
    </svg>
  );
}
