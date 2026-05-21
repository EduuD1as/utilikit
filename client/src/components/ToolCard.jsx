import { ToolIcon } from './ToolIcon.jsx';

export function ToolCard({ tool, onOpen }) {
  const handleClick = () => {
    if (tool.available) onOpen(tool.path);
  };

  return (
    <article
      className={`tool-card${tool.available ? '' : ' tool-card--soon'}`}
      style={{ '--tool-accent': tool.accent }}
    >
      <button
        type="button"
        className="tool-card__btn"
        onClick={handleClick}
        disabled={!tool.available}
        aria-label={
          tool.available
            ? `Abrir ${tool.title}`
            : `${tool.title} — em breve`
        }
      >
        <span className="tool-card__icon" aria-hidden="true">
          <ToolIcon name={tool.icon} />
        </span>
        <span className="tool-card__body">
          <span className="tool-card__title-row">
            <h3 className="tool-card__title">{tool.title}</h3>
            <span className={`tool-card__badge${tool.available ? ' tool-card__badge--live' : ''}`}>
              {tool.available ? 'Disponível' : 'Em breve'}
            </span>
          </span>
          <p className="tool-card__desc">{tool.description}</p>
        </span>
        {tool.available && (
          <span className="tool-card__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </span>
        )}
      </button>
    </article>
  );
}
