/**
 * Avaliador de expressões aritméticas (sem eval).
 * Suporta + - * / ^, parênteses, menos unário e % no estilo de calculadora:
 * "200 + 10%" = 220, "50 * 10%" = 5.
 */
export function evaluate(expression) {
  const src = expression.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/,/g, '.');
  let pos = 0;

  const peek = () => src[pos];
  const fail = () => {
    throw new Error('syntax');
  };

  function number() {
    const match = src.slice(pos).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
    if (!match) fail();
    pos += match[0].length;
    return Number(match[0]);
  }

  // primary := number | '(' expr ')' ; postfix '%'
  function primary() {
    let value;
    if (peek() === '(') {
      pos += 1;
      value = expr().value;
      if (peek() !== ')') fail();
      pos += 1;
    } else {
      value = number();
    }
    if (peek() === '%') {
      pos += 1;
      return { value: value / 100, percent: true };
    }
    return { value, percent: false };
  }

  function unary() {
    if (peek() === '-') {
      pos += 1;
      const inner = unary();
      return { value: -inner.value, percent: inner.percent };
    }
    if (peek() === '+') {
      pos += 1;
      return unary();
    }
    return primary();
  }

  function power() {
    const base = unary();
    if (peek() === '^') {
      pos += 1;
      const exp = power();
      return { value: base.value ** exp.value, percent: false };
    }
    return base;
  }

  function term() {
    let left = power();
    while (peek() === '*' || peek() === '/') {
      const op = src[pos];
      pos += 1;
      const right = power();
      left = { value: op === '*' ? left.value * right.value : left.value / right.value, percent: false };
    }
    return left;
  }

  function expr() {
    let left = term();
    while (peek() === '+' || peek() === '-') {
      const op = src[pos];
      pos += 1;
      const right = term();
      const delta = right.percent ? left.value * right.value : right.value;
      left = { value: op === '+' ? left.value + delta : left.value - delta, percent: false };
    }
    return left;
  }

  if (!src) return null;
  const result = expr().value;
  if (pos !== src.length) fail();
  return result;
}

/** Arredonda ruído de ponto flutuante (0.1 + 0.2 = 0.3). */
export function clean(value) {
  if (!Number.isFinite(value)) return value;
  return Number(value.toPrecision(12));
}
