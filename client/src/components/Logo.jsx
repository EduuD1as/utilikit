export function Logo({ size = 52, className = '', onNavigate }) {
  function handleClick() {
    if (onNavigate) {
      onNavigate('/');
      return;
    }
    window.location.reload();
  }

  return (
    <button
      type="button"
      className={`logo-btn ${className}`.trim()}
      onClick={handleClick}
      aria-label={onNavigate ? 'Voltar ao início' : 'Atualizar página'}
      title={onNavigate ? 'Voltar ao início' : 'Atualizar página'}
    >
      <img
        src="/logo.svg"
        alt=""
        width={size}
        height={size}
        decoding="async"
        draggable={false}
      />
    </button>
  );
}
