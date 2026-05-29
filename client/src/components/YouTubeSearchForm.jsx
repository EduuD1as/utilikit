import { useLanguage } from '../context/LanguageContext';

export function YouTubeSearchForm({ onSearch, loading, disabled }) {
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get('query');
    if (query) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        name="query"
        placeholder={t('youtubeSearchPlaceholder')}
        disabled={disabled || loading}
        className="search-form__input"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={disabled || loading}
        className="search-form__button"
      >
        {loading ? t('youtubeSearching') : t('youtubeSearchButton')}
      </button>
    </form>
  );
}
