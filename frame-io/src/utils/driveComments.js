// Google Drive Comments API integration
const COMMENTS_FILE_NAME = 'frame-io-comments.json';

// Function to extract file ID from drive link
export function getDriveFileId(url) {
  try {
    const u = new URL(url.trim());
    let id = null;

    if (u.pathname.includes("/file/d/")) {
      const m = u.pathname.match(/\/file\/d\/([^/]+)/);
      if (m) id = m[1];
    } else if (u.searchParams.get("id")) {
      id = u.searchParams.get("id");
    }

    return id;
  } catch {
    return null;
  }
}

// Store comments for a specific video in Drive
export async function saveCommentsToDrive(fileId, comments) {
  try {
    const endpoint = `/api/drive/comments/${fileId}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comments }),
    });

    if (!response.ok) {
      throw new Error('Failed to save comments');
    }

    return true;
  } catch (error) {
    console.error('Error saving comments:', error);
    return false;
  }
}

// Fetch comments for a specific video from Drive
export async function fetchCommentsFromDrive(fileId) {
  try {
    const endpoint = `/api/drive/comments/${fileId}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }

    const data = await response.json();
    return data.comments || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}