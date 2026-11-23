/** Acesso ao localStorage que não quebra em modo privado ou com cookies bloqueados. */
export function readStorage(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sem armazenamento disponível: a preferência vale só nesta sessão.
  }
}

export function readJson(key, fallback = null) {
  const raw = readStorage(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  writeStorage(key, JSON.stringify(value));
}
