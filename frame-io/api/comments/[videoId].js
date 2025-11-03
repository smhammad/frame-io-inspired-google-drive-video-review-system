// Simple in-memory store for demo (resets on redeploy)
const commentsStore = {};

export default async function handler(req, res) {
  const { videoId } = req.query;

  if (req.method === 'GET') {
    // Return comments for this videoId
    return res.status(200).json({ comments: commentsStore[videoId] || [] });
  }

  if (req.method === 'POST') {
    // Save comments for this videoId
    const { comments } = req.body;
    if (!Array.isArray(comments)) {
      return res.status(400).json({ error: 'Invalid comments array' });
    }
    commentsStore[videoId] = comments;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
