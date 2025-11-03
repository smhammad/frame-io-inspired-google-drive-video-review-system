import { google } from 'googleapis';
import { getToken } from '../auth/google';

export default async function handler(req, res) {
  const { fileId } = req.query;
  const { method } = req;

  try {
    const auth = await getToken();
    const drive = google.drive({ version: 'v3', auth });

    if (method === 'GET') {
      // Get comments file metadata
      const commentsFileName = `comments-${fileId}.json`;
      const response = await drive.files.list({
        q: `name='${commentsFileName}' and trashed=false`,
        fields: 'files(id, name)',
      });

      let commentsFileId = response.data.files[0]?.id;

      if (!commentsFileId) {
        // Return empty comments if file doesn't exist
        return res.status(200).json({ comments: [] });
      }

      // Get comments content
      const content = await drive.files.get({
        fileId: commentsFileId,
        alt: 'media',
      });

      return res.status(200).json({ comments: content.data });
    }

    if (method === 'POST') {
      const { comments } = req.body;
      const commentsFileName = `comments-${fileId}.json`;

      // Check if comments file exists
      const response = await drive.files.list({
        q: `name='${commentsFileName}' and trashed=false`,
        fields: 'files(id, name)',
      });

      let commentsFileId = response.data.files[0]?.id;

      if (!commentsFileId) {
        // Create new comments file
        const fileMetadata = {
          name: commentsFileName,
          mimeType: 'application/json',
        };

        const file = await drive.files.create({
          resource: fileMetadata,
          media: {
            mimeType: 'application/json',
            body: JSON.stringify(comments),
          },
          fields: 'id',
        });

        commentsFileId = file.data.id;

        // Make the file accessible to anyone with the link
        await drive.permissions.create({
          fileId: commentsFileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      } else {
        // Update existing comments file
        await drive.files.update({
          fileId: commentsFileId,
          media: {
            mimeType: 'application/json',
            body: JSON.stringify(comments),
          },
        });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Drive API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}