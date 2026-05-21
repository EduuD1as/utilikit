import { format } from 'sql-formatter';

export const SQL_DIALECTS = [
  { id: 'sql', label: 'ANSI SQL' },
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'mariadb', label: 'MariaDB' },
  { id: 'sqlite', label: 'SQLite' },
  { id: 'tsql', label: 'SQL Server' },
  { id: 'plsql', label: 'Oracle PL/SQL' },
  { id: 'bigquery', label: 'BigQuery' },
];

export function formatSqlQuery(sql, { dialect = 'sql', tabWidth = 2, keywordCase = 'upper' } = {}) {
  return format(sql, {
    language: dialect,
    tabWidth,
    keywordCase,
    linesBetweenQueries: 2,
  });
}

export function minifySqlQuery(sql, { dialect = 'sql' } = {}) {
  return format(sql, {
    language: dialect,
    tabWidth: 0,
    linesBetweenQueries: 0,
    keywordCase: 'preserve',
  });
}
