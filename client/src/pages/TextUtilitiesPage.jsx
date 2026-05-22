import { useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';

export function TextUtilitiesPage({ onNavigate }) {
  const [text, setText] = useState('');
  const [converted, setConverted] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.trim() ? text.split('\n').length : 0,
    paragraphs: text.trim() ? text.split(/\n\s*\n/).length : 0,
    sentences: text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0,
    averageWordLength: text.trim()
      ? (text.replace(/\s/g, '').length / (text.trim().split(/\s+/).length || 1)).toFixed(1)
      : 0,
  };

  const conversions = {
    uppercase: {
      title: '🔤 MAIÚSCULAS',
      icon: '⬆️',
      convert: () => text.toUpperCase(),
    },
    lowercase: {
      title: '🔡 minúsculas',
      icon: '⬇️',
      convert: () => text.toLowerCase(),
    },
    capitalize: {
      title: '📝 Capitalizado',
      icon: '🔤',
      convert: () =>
        text
          .toLowerCase()
          .split('\n')
          .map(line =>
            line
              .split(/\s+/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
          )
          .join('\n'),
    },
    titlecase: {
      title: '📰 Title Case',
      icon: '📄',
      convert: () => {
        const smallWords = ['de', 'do', 'da', 'e', 'ou', 'a', 'o', 'um', 'uma'];
        return text
          .toLowerCase()
          .split('\n')
          .map(line =>
            line
              .split(/\s+/)
              .map((word, idx) =>
                idx === 0 || !smallWords.includes(word)
                  ? word.charAt(0).toUpperCase() + word.slice(1)
                  : word
              )
              .join(' ')
          )
          .join('\n');
      },
    },
    inverse: {
      title: '🔀 iNVERTIDO',
      icon: '🔄',
      convert: () =>
        text
          .split('')
          .map(char => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()))
          .join(''),
    },
    reverse: {
      title: '↩️ Reverso',
      icon: '⬅️',
      convert: () => text.split('').reverse().join(''),
    },
    removeSpaces: {
      title: '🚫 Remover Espaços',
      icon: '📦',
      convert: () => text.replace(/\s+/g, ' ').trim(),
    },
    removeExtraSpaces: {
      title: '📍 Remover Espaços Duplos',
      icon: '⚙️',
      convert: () => text.replace(/\s+/g, ' ').trim(),
    },
    removeAccents: {
      title: '❌ Sem Acentos',
      icon: '✂️',
      convert: () =>
        text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    },
    slugify: {
      title: '🔗 Slug (URL-friendly)',
      icon: '⛓️',
      convert: () =>
        text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')
          .replace(/-+/g, '-'),
    },
  };

  const doConversion = (conversionKey) => {
    const result = conversions[conversionKey].convert();
    setConverted(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(converted);
    setCopyStatus('Copiado!');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const clearText = () => {
    setText('');
    setConverted('');
  };

  return (
    <div className="app app--converter">
      <header className="hero">
        <div className="hero__brand">
          <Logo size={52} className="hero__logo" onNavigate={onNavigate} />
          <div>
            <button
              type="button"
              className="hero__back"
              onClick={() => onNavigate('/')}
            >
              ← Todas as ferramentas
            </button>
            <h1>Utilitários de Texto</h1>
            <p className="hero__subtitle">
              Contador de caracteres, conversores de caso e mais ferramentas para texto
            </p>
          </div>
        </div>
      </header>

      <main className="panel fx-panel">
        <div className="text-utils">
          {/* Input */}
          <div className="text-input-section">
            <label className="form-label">Seu Texto</label>
            <textarea
              className="form-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite ou cole seu texto aqui..."
              rows="6"
            />
            {text && (
              <button
                type="button"
                className="btn-ghost"
                onClick={clearText}
              >
                Limpar
              </button>
            )}
          </div>

          {/* Stats */}
          {text && (
            <div className="text-stats">
              <div className="stat-item">
                <span className="stat-label">Caracteres</span>
                <span className="stat-value">{stats.characters}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sem Espaços</span>
                <span className="stat-value">{stats.charactersNoSpaces}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Palavras</span>
                <span className="stat-value">{stats.words}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Linhas</span>
                <span className="stat-value">{stats.lines}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Parágrafos</span>
                <span className="stat-value">{stats.paragraphs}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sentenças</span>
                <span className="stat-value">{stats.sentences}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Média por Palavra</span>
                <span className="stat-value">{stats.averageWordLength}</span>
              </div>
            </div>
          )}

          {/* Conversions */}
          <div className="text-conversions">
            <h3 className="text-conversions__title">🔧 Conversores</h3>
            <div className="text-conversion-grid">
              {Object.entries(conversions).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  className="text-conversion-btn"
                  onClick={() => doConversion(key)}
                  title={config.title}
                >
                  <span className="text-conversion-icon">{config.icon}</span>
                  <span className="text-conversion-label">{config.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Output */}
          {converted && (
            <div className="text-output-section">
              <div className="output-header">
                <label className="form-label">Resultado</label>
                <button
                  type="button"
                  className="btn-copy"
                  onClick={copyToClipboard}
                >
                  {copyStatus || '📋 Copiar'}
                </button>
              </div>
              <textarea
                className="form-textarea"
                value={converted}
                readOnly
                rows="6"
              />
              <p className="output-stats">
                {converted.length} caracteres • {converted.split(/\s+/).filter(w => w).length} palavras
              </p>
            </div>
          )}

          <div className="text-info">
            <p className="text-info__title">ℹ️ Como Usar</p>
            <ul className="text-info__list">
              <li>
                <strong>Digite ou cole</strong> seu texto na área de entrada
              </li>
              <li>
                <strong>Visualize as estatísticas</strong> de caracteres, palavras, linhas, etc
              </li>
              <li>
                <strong>Clique em um conversor</strong> para transformar o texto
              </li>
              <li>
                <strong>Copie o resultado</strong> com um clique
              </li>
              <li>
                <strong>Privacidade:</strong> Todo processamento é local, nenhum dado é enviado
              </li>
            </ul>
          </div>
        </div>

        <p className="fx-disclaimer">
          Todo processamento ocorre localmente no seu navegador. Seus dados não são enviados para servidores.
        </p>
      </main>

      <SiteFooter
        onNavigate={onNavigate}
        note="Utilitários de texto executados no navegador."
      />
    </div>
  );
}
