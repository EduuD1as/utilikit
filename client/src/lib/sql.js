import { format } from 'sql-formatter';

/**
 * Dialetos expostos na interface. `language` é o dialeto do sql-formatter
 * usado por baixo; Firebird não tem dialeto próprio e o PL/SQL é o que mais se
 * aproxima (aceita `:parametro`, `rdb$tabela`, `||`, FIRST/SKIP, RETURNING).
 */
export const SQL_DIALECTS = [
  { id: 'sql', label: 'SQL padrão', language: 'sql' },
  { id: 'postgresql', label: 'PostgreSQL', language: 'postgresql' },
  { id: 'mysql', label: 'MySQL', language: 'mysql' },
  { id: 'mariadb', label: 'MariaDB', language: 'mariadb' },
  { id: 'tsql', label: 'SQL Server (T-SQL)', language: 'tsql' },
  { id: 'plsql', label: 'Oracle (PL/SQL)', language: 'plsql' },
  { id: 'firebird', label: 'Firebird', language: 'plsql' },
  { id: 'sqlite', label: 'SQLite', language: 'sqlite' },
  { id: 'bigquery', label: 'BigQuery', language: 'bigquery' },
  { id: 'snowflake', label: 'Snowflake', language: 'snowflake' },
  { id: 'redshift', label: 'Redshift', language: 'redshift' },
  { id: 'duckdb', label: 'DuckDB', language: 'duckdb' },
  { id: 'clickhouse', label: 'ClickHouse', language: 'clickhouse' },
  { id: 'spark', label: 'Spark SQL', language: 'spark' },
  { id: 'trino', label: 'Trino / Presto', language: 'trino' },
  { id: 'db2', label: 'IBM Db2', language: 'db2' },
];

const DIALECT_BY_ID = Object.fromEntries(SQL_DIALECTS.map((d) => [d.id, d]));

/** Dialetos tentados, em ordem, quando o escolhido não entende a consulta. */
const FALLBACK_ORDER = ['sql', 'plsql', 'postgresql', 'tsql', 'mysql', 'bigquery'];

/** O dialeto genérico também aceita os parâmetros mais comuns: ?, :nome, @nome, $1. */
const GENERIC_PARAMS = { positional: true, named: [':', '@'], numbered: ['$'] };

export class SqlParseError extends Error {
  constructor(message, line, column) {
    super(message);
    this.name = 'SqlParseError';
    this.line = line;
    this.column = column;
  }
}

function toParseError(error) {
  const first = String(error?.message ?? error).split('\n')[0].trim();
  const match = first.match(/at line (\d+) column (\d+)/i);
  const unexpected = first.match(/Unexpected "(.*?)"/) || first.match(/at token: (.+?) at line/i);
  let token = unexpected ? unexpected[1].trim() : first;
  if (/«?EOF»?/.test(token)) token = 'EOF';
  token = token.replace(/^«|»$/g, '');
  return new SqlParseError(
    token,
    match ? Number(match[1]) : null,
    match ? Number(match[2]) : null
  );
}

/** Ajustes para construções do Firebird que o dialeto base quebra em linhas erradas. */
function fixFirebird(output, keywordCase) {
  const kw = (word) =>
    keywordCase === 'upper' ? word.toUpperCase() : keywordCase === 'lower' ? word.toLowerCase() : word;
  return output
    .replace(/\b(starting)\s*\n?\s*(with)\b\s*\n?\s*/gi, (_, a, b) => `${kw(a)} ${kw(b)} `)
    .replace(/\b(update)\s*\n\s*(or)\s*\n\s*(insert into)\b/gi, (_, a, b, c) => `${kw(a)} ${kw(b)} ${kw(c)}`)
    .replace(/\b(first|skip|rows)(\s+(?:\d+|:\w+|\?))/gi, (_, a, rest) => `${kw(a)}${rest}`)
    .replace(/\b(containing|matching)\b/gi, (word) => kw(word))
    .replace(/\b(gen_id|list|substring|position|trim|extract|cast|coalesce) \(/gi, '$1(');
}

function runFormat(sql, language, options) {
  return format(sql, {
    language,
    tabWidth: options.indent === 'tab' ? 4 : Number(options.indent) || 2,
    useTabs: options.indent === 'tab',
    keywordCase: options.keywordCase,
    dataTypeCase: options.keywordCase,
    functionCase: options.functionCase ?? options.keywordCase,
    identifierCase: 'preserve',
    logicalOperatorNewline: options.logicalOperatorNewline ?? 'before',
    expressionWidth: Number(options.expressionWidth) || 50,
    linesBetweenQueries: Number(options.linesBetweenQueries ?? 1),
    denseOperators: Boolean(options.denseOperators),
    newlineBeforeSemicolon: Boolean(options.newlineBeforeSemicolon),
    paramTypes: language === 'sql' ? GENERIC_PARAMS : undefined,
  });
}

/**
 * Formata SQL no dialeto escolhido. Se o parser não entender a consulta,
 * tenta outros dialetos antes de desistir e informa qual funcionou.
 * @returns {{ output: string, usedDialect: string, fallback: boolean }}
 */
export function formatSql(sql, options = {}) {
  const dialect = DIALECT_BY_ID[options.dialect] ?? DIALECT_BY_ID.sql;
  const post = dialect.id === 'firebird' ? (text) => fixFirebird(text, options.keywordCase) : (text) => text;

  let firstError;
  try {
    return { output: post(runFormat(sql, dialect.language, options)), usedDialect: dialect.id, fallback: false };
  } catch (error) {
    firstError = error;
  }

  for (const language of FALLBACK_ORDER) {
    if (language === dialect.language) continue;
    try {
      const output = post(runFormat(sql, language, options));
      const used = SQL_DIALECTS.find((d) => d.language === language && d.id === language) ?? dialect;
      return { output, usedDialect: used.id, fallback: true };
    } catch {
      // Próximo dialeto.
    }
  }

  throw toParseError(firstError);
}

/**
 * Remove comentários e espaços desnecessários sem tocar em strings,
 * identificadores entre aspas, blocos $$ do PostgreSQL ou hints /*+ do Oracle.
 */
export function minifySql(sql, { dialect = 'sql' } = {}) {
  const brackets = dialect === 'tsql';
  const out = [];
  let pendingSpace = false;
  let i = 0;
  const n = sql.length;

  const emit = (text) => {
    if (pendingSpace && out.length) {
      const prev = out[out.length - 1].slice(-1);
      const next = text[0];
      if (!/[(,;]/.test(prev) && !/[),;]/.test(next)) out.push(' ');
    }
    pendingSpace = false;
    out.push(text);
  };

  const readQuoted = (open, close, doubled) => {
    let j = i + 1;
    while (j < n) {
      if (sql[j] === close) {
        if (doubled && sql[j + 1] === close) {
          j += 2;
          continue;
        }
        break;
      }
      if (sql[j] === '\\' && open === "'" && dialect.match(/mysql|mariadb|bigquery/)) j += 1;
      j += 1;
    }
    const text = sql.slice(i, j + 1);
    i = j + 1;
    return text;
  };

  while (i < n) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (/\s/.test(ch)) {
      pendingSpace = true;
      i += 1;
    } else if (ch === '-' && next === '-') {
      while (i < n && sql[i] !== '\n') i += 1;
      pendingSpace = true;
    } else if (ch === '#' && /mysql|mariadb/.test(dialect)) {
      while (i < n && sql[i] !== '\n') i += 1;
      pendingSpace = true;
    } else if (ch === '/' && next === '*') {
      const end = sql.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      if (sql[i + 2] === '+') emit(sql.slice(i, stop));
      else pendingSpace = true;
      i = stop;
    } else if (ch === "'") {
      emit(readQuoted("'", "'", true));
    } else if (ch === '"') {
      emit(readQuoted('"', '"', true));
    } else if (ch === '`') {
      emit(readQuoted('`', '`', true));
    } else if (ch === '[' && brackets) {
      emit(readQuoted('[', ']', true));
    } else if (ch === '$') {
      const tag = sql.slice(i).match(/^\$[A-Za-z_]*\$/);
      if (tag) {
        const end = sql.indexOf(tag[0], i + tag[0].length);
        const stop = end === -1 ? n : end + tag[0].length;
        emit(sql.slice(i, stop));
        i = stop;
      } else {
        emit(ch);
        i += 1;
      }
    } else {
      let j = i + 1;
      // Agrupa caracteres "comuns" em um token para reduzir trabalho.
      while (j < n && !/[\s'"`$[\-/#]/.test(sql[j])) j += 1;
      if (j === i + 1 || /[(),;]/.test(ch)) {
        emit(ch);
        i += 1;
      } else {
        // Quebra o pedaço em pontuação para remover espaços ao redor de ( ) , ;
        const chunk = sql.slice(i, j);
        for (const part of chunk.split(/([(),;])/)) if (part) emit(part);
        i = j;
      }
    }
  }

  return out.join('').trim();
}

