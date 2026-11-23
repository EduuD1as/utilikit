/** Converte a posição (índice) de um erro de JSON.parse em linha e coluna. */
function positionToLineCol(text, position) {
  const before = text.slice(0, position);
  const lines = before.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

/**
 * Faz o parse e, em caso de erro, devolve mensagem com linha e coluna.
 * Os navegadores formatam a mensagem de jeitos diferentes, então tratamos
 * "position N", "line N column M" e o caso de fim inesperado.
 */
export function parseJson(text) {
  try {
    return { value: JSON.parse(text), error: null };
  } catch (err) {
    const message = String(err.message);
    let line = null;
    let column = null;
    const lineCol = message.match(/line (\d+) column (\d+)/i);
    const pos = message.match(/position (\d+)/i);
    if (lineCol) {
      line = Number(lineCol[1]);
      column = Number(lineCol[2]);
    } else if (pos) {
      ({ line, column } = positionToLineCol(text, Number(pos[1])));
    } else if (/unexpected end/i.test(message)) {
      ({ line, column } = positionToLineCol(text, text.length));
    }
    const clean = message.replace(/^JSON\.parse:\s*/i, '').replace(/ in JSON at position \d+.*$/i, '');
    return { value: undefined, error: { message: clean, line, column } };
  }
}

export function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => [key, sortKeysDeep(value[key])])
    );
  }
  return value;
}

export function describeJson(value) {
  let keys = 0;
  let depth = 0;
  const walk = (node, level) => {
    depth = Math.max(depth, level);
    if (Array.isArray(node)) node.forEach((item) => walk(item, level + 1));
    else if (node && typeof node === 'object') {
      for (const key of Object.keys(node)) {
        keys += 1;
        walk(node[key], level + 1);
      }
    }
  };
  walk(value, 0);
  const type = Array.isArray(value) ? `array[${value.length}]` : value === null ? 'null' : typeof value;
  return { type, keys, depth };
}

export function byteSize(text) {
  return new TextEncoder().encode(text).length;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
