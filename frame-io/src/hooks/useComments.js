import { useEffect, useState } from "react";
import { getDriveFileId, fetchCommentsFromDrive, saveCommentsToDrive } from "../utils/driveComments";

export default function useComments(videoUrl) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const fileId = getDriveFileId(videoUrl);

  // Function to load comments from Drive
  const loadComments = async () => {
    if (!fileId) return;
    try {
      const fetchedComments = await fetchCommentsFromDrive(fileId);
      
      // Only update if there are changes
      if (JSON.stringify(fetchedComments) !== JSON.stringify(comments)) {
        console.log('[useComments] New comments detected, updating state');
        setComments(fetchedComments);
        setLastUpdate(new Date().toISOString());
      }
    } catch (error) {
      console.error('[useComments] Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!fileId) {
      setComments([]);
      setLoading(false);
      return;
    }

    // Only load comments from Drive if we don't have any initial comments
    // This prevents overwriting comments that came from the share URL
    if (comments.length === 0) {
      loadComments();
    }
  }, [fileId]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!fileId) return;

    const pollInterval = setInterval(loadComments, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [fileId, lastUpdate]);

  useEffect(() => {
    if (!fileId || loading) return;

    const saveComments = async () => {
      await saveCommentsToDrive(fileId, comments);
    };

    saveComments();
  }, [comments, fileId, loading]);

  const addComment = async (comment) => {
    // Remove image data if present to avoid storage issues
    const { image, ...commentWithoutImage } = comment;
    
    const newComment = {
      ...commentWithoutImage,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
    
    setComments((prev) => [...prev, newComment]);
  };

  const deleteComment = (index) => {
    setComments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const toggleResolved = (index) => {
    setComments((prev) => 
      prev.map((comment, idx) => 
        idx === index 
          ? { ...comment, resolved: !comment.resolved }
          : comment
      )
    );
  };

  const clearAll = () => setComments([]);

  const exportComments = (rows) => {
    const header = "timestamp_seconds,timestamp_hhmmss,comment,status\n";
    const body = rows
      .map((c) => 
        `${c.time.toFixed(2)},${toHHMMSS(c.time)},"${escapeCsv(c.text)}",${c.resolved ? "resolved" : "active"}`
      )
      .join("\n");
    const csv = header + body;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "comments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    toggleResolved,
    clearAll,
    exportComments,
  };
}

function toHHMMSS(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function escapeCsv(text) {
  return (text || "").replace(/"/g, '""');
}
