/** Base64 com UTF-8 de verdade (btoa/atob sozinhos quebram com acentos e emojis). */
export function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBytes(base64) {
  let clean = base64.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (/[^A-Za-z0-9+/=]/.test(clean)) throw new Error('invalid-base64');
  const pad = clean.length % 4;
  if (pad === 1) throw new Error('invalid-base64');
  if (pad) clean += '='.repeat(4 - pad);
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeBase64(text, { urlSafe = false } = {}) {
  const b64 = bytesToBase64(new TextEncoder().encode(text));
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}

export function decodeBase64(text) {
  const bytes = base64ToBytes(text);
  // fatal: true faz o decodificador acusar bytes que não são UTF-8 válido.
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function encodeUrl(text, { component = true } = {}) {
  return component ? encodeURIComponent(text) : encodeURI(text);
}

export function decodeUrl(text) {
  return decodeURIComponent(text.replace(/\+/g, ' '));
}

export function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
