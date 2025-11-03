import { getDriveFileId } from "./driveComments";

// Generate a shareable link that includes the video URL and comments
export function generateShareableLink(videoUrl, comments = []) {
  try {
    // Get the current URL without query parameters
    const baseUrl = window.location.href.split('?')[0];
    
    // Create the share payload with video URL and comments
    const payload = {
      videoUrl,
      comments,
      timestamp: new Date().toISOString(),
    };
    
    // Encode the payload
    const encoded = encodeShare(payload);
    return `${baseUrl}?share=${encoded}`;
  } catch (err) {
    console.error('generateShareableLink failed', err);
    return null;
  }
}

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
