import { format } from 'sql-formatter';

export const SQL_DIALECTS = [
  { id: 'sql', label: 'ANSI SQL' },
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'mariadb', label: 'MariaDB' },
  { id: 'sqlite', label: 'SQLite' },
  { id: 'firebird', label: 'Firebird' },
  { id: 'tsql', label: 'SQL Server' },
  { id: 'plsql', label: 'Oracle PL/SQL' },
  { id: 'bigquery', label: 'BigQuery' },
];

/** Dialetos sem suporte nativo no sql-formatter usam o mais próximo. */
const DIALECT_LANGUAGE = {
  firebird: 'sql',
};

function resolveLanguage(dialect) {
  return DIALECT_LANGUAGE[dialect] ?? dialect;
}

function extractValidSql(sql) {
  // Remove caracteres especiais no início e fim que podem causar erro
  // Mantém apenas a parte que parece ser SQL válido
  let cleaned = sql.trim();

  // Se começar com |, remove tudo até encontrar uma palavra-chave SQL
  if (cleaned.startsWith('|')) {
    const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE'];
    for (const keyword of sqlKeywords) {
      const keywordIndex = cleaned.toUpperCase().indexOf(keyword);
      if (keywordIndex > 0) {
        cleaned = cleaned.substring(keywordIndex);
        break;
      }
    }
  }

  // Se terminar com |, remove
  if (cleaned.endsWith('|')) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned.trim();
}

export function formatSqlQuery(sql, { dialect = 'sql', tabWidth = 2, keywordCase = 'upper' } = {}) {
  const cleanedSql = extractValidSql(sql);
  try {
    return format(cleanedSql, {
      language: resolveLanguage(dialect),
      tabWidth,
      keywordCase,
      linesBetweenQueries: 2,
    });
  } catch (error) {
    // Se ainda falhar, tenta formatar sem validação
    try {
      return format(cleanedSql, {
        language: resolveLanguage(dialect),
        tabWidth,
        keywordCase,
        linesBetweenQueries: 2,
      });
    } catch {
      // Se falhar completamente, retorna o SQL original limpo
      return cleanedSql;
    }
  }
}

export function minifySqlQuery(sql, { dialect = 'sql' } = {}) {
  const cleanedSql = extractValidSql(sql);
  try {
    return format(cleanedSql, {
      language: resolveLanguage(dialect),
      tabWidth: 0,
      linesBetweenQueries: 0,
      keywordCase: 'preserve',
    });
  } catch (error) {
    // Se falhar, tenta formatar sem validação
    try {
      return format(cleanedSql, {
        language: resolveLanguage(dialect),
        tabWidth: 0,
        linesBetweenQueries: 0,
        keywordCase: 'preserve',
      });
    } catch {
      // Se falhar completamente, retorna o SQL original limpo
      return cleanedSql;
    }
  }
}
