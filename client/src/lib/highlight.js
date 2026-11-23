import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('sql', sql);
hljs.registerLanguage('json', json);

export function highlightSql(code) {
  return hljs.highlight(code, { language: 'sql', ignoreIllegals: true }).value;
}

export function highlightJson(code) {
  return hljs.highlight(code, { language: 'json', ignoreIllegals: true }).value;
}
