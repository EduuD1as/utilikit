export function formatJson(jsonString, tabWidth = 2) {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed, null, tabWidth);
}

export function minifyJson(jsonString) {
  const parsed = JSON.parse(jsonString);
  return JSON.stringify(parsed);
}

export function validateJson(jsonString) {
  try {
    JSON.parse(jsonString);
    return { valid: true, error: null };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

export function getSizeInfo(jsonString) {
  const original = jsonString.length;
  const minified = JSON.stringify(JSON.parse(jsonString)).length;
  const formatted = JSON.stringify(JSON.parse(jsonString), null, 2).length;
  
  return {
    original,
    minified,
    formatted,
    saved: Math.round(((original - minified) / original) * 100),
  };
}
