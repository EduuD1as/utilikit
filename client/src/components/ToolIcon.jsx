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
      strokeLinejoin="round"
      d="M8 8l8 8M12 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"
    />
  ),
  scale: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12h18M12 3v18M7 7c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v10H7V7Zm1 0h8v2H8V7Z"
    />
  ),
  chart: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3v18h18M7 14v4M12 9v9M17 5v13"
    />
  ),
  currency: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v18M6 7h12c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2Z"
    />
  ),
  ruler: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10h18M5 6h2M9 6h2M13 6h2M17 6h2M5 14h2M9 14h2M13 14h2M17 14h2M3 6v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6"
    />
  ),
  code: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m7 8-3 3 3 3m10-6 3 3-3 3M14 4l-4 16"
    />
  ),
  lock: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 10V8c0-2.8 2.2-5 5-5s5 2.2 5 5v2m-10 2h14c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2Zm7 4c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1Z"
    />
  ),
  hash: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 3l-1 18M16 3l-1 18M3 8h18M3 16h18"
    />
  ),
  qr: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3h6v6H3V3Zm10 0h6v6h-6V3ZM3 13h6v6H3v-6Zm7 2h2v2h-2v-2Zm3-2h2v2h-2v-2Zm2 3h2v2h-2v-2Zm0-6h2v2h-2v-2Z"
    />
  ),
  text: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 6h18M3 12h12M3 18h16"
    />
  ),
  database: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 6c0 1.7 3.6 3 8 3s8-1.3 8-3m0 5c0 1.7-3.6 3-8 3s-8-1.3-8-3m0 5c0 1.7 3.6 3 8 3s8-1.3 8-3M3 6v10c0 1.7 3.6 3 8 3s8-1.3 8-3V6"
    />
  ),
  clock: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Zm0 5v5l3 2"
    />
  ),
  file: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9l-7-7ZM13 2v7h7M8 13h8M8 17h8M10 9H8"
    />
  ),
  game: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 9c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V9Zm4-3h4M9 15h6M10 6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1Zm2 8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1Z"
    />
  ),
  wheel: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2Zm0 3c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7ZM12 8c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4ZM12 2v3M12 19v3M21 12h-3M6 12H3"
    />
  ),
  activity: (
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12h6l2 4 2-6 2 4h6M3 6h18M3 18h18"
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
