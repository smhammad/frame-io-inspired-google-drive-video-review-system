import { google } from 'googleapis';
import { getToken } from '../../auth/google';

export default async function handler(req, res) {
  const { videoFileId } = req.query;

  try {
    const auth = await getToken();
    const drive = google.drive({ version: 'v3', auth });

    // Look for existing comments file for this video
    const searchQuery = `name='comments-${videoFileId}.json' and trashed=false`;
    const response = await drive.files.list({
      q: searchQuery,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    let commentsFileId = response.data.files[0]?.id;

    // If no comments file exists, create one
    if (!commentsFileId) {
      const fileMetadata = {
        name: `comments-${videoFileId}.json`,
        mimeType: 'application/json',
        description: `Comments for video ${videoFileId}`,
      };

      const file = await drive.files.create({
        resource: fileMetadata,
        media: {
          mimeType: 'application/json',
          body: JSON.stringify([]),
        },
        fields: 'id',
      });

      commentsFileId = file.data.id;

      // Make the comments file accessible to anyone with the link
      await drive.permissions.create({
        fileId: commentsFileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    }

    return res.status(200).json({ commentsFileId });
  } catch (error) {
    console.error('Drive API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}