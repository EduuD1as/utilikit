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

export function formatSqlQuery(sql, { dialect = 'sql', tabWidth = 2, keywordCase = 'upper' } = {}) {
  return format(sql, {
    language: resolveLanguage(dialect),
    tabWidth,
    keywordCase,
    linesBetweenQueries: 2,
  });
}

export function minifySqlQuery(sql, { dialect = 'sql' } = {}) {
  return format(sql, {
    language: resolveLanguage(dialect),
    tabWidth: 0,
    linesBetweenQueries: 0,
    keywordCase: 'preserve',
  });
}
