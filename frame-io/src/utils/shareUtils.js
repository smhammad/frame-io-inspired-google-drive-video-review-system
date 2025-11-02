// Small helpers to encode/decode share payloads into URL-safe base64
export function encodeShare(obj) {
  try {
    const json = JSON.stringify(obj);
    // btoa/unescape trick to handle UTF-8
    return btoa(unescape(encodeURIComponent(json)));
  } catch (err) {
    console.error('encodeShare failed', err);
    return null;
  }
}

export function decodeShare(s) {
  try {
    const json = decodeURIComponent(escape(atob(s)));
    return JSON.parse(json);
  } catch (err) {
    console.error('decodeShare failed', err);
    return null;
  }
}
