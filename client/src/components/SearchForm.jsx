import { useState } from 'react';

export function SearchForm({ onSearch, loading, disabled }) {
  const [query, setQuery] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(query);
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <div className="search__field">
        <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.8 8.001a4.5 4.5 0 0 0-8.1-2.7 4.5 4.5 0 1 0-6.4 6.4l-4.3 4.3 1.4 1.4 4.3-4.3a4.5 4.5 0 0 0 6.1-5.1Z"
          />
        </svg>
        <input
          type="text"
          className="search__input"
          placeholder="Cole o link ou digite o nome do canal (@canal)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading || disabled}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      <button
        type="submit"
        className="search__btn"
        disabled={loading || disabled || !query.trim()}
      >
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Buscando…
          </>
        ) : (
          'Buscar inscritos'
        )}
      </button>
    </form>
  );
}
