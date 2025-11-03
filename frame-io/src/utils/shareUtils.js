import { getDriveFileId, getCommentsFileId } from './driveComments';

// Create a share payload that includes the comments file ID
export async function createSharePayload(videoUrl) {
  const videoFileId = getDriveFileId(videoUrl);
  if (!videoFileId) return null;

  // Get or create the comments file ID
  const commentsFileId = await getCommentsFileId(videoFileId);
  
  return {
    videoUrl,
    commentsFileId,
    timestamp: new Date().toISOString()
  };
}

// Encode share payload into URL-safe base64
export async function encodeShare(videoUrl) {
  try {
    const payload = await createSharePayload(videoUrl);
    if (!payload) return null;

    const json = JSON.stringify(payload);
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
