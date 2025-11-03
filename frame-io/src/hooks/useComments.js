import { useEffect, useState } from "react";

export default function useComments(videoUrl) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  // Use videoId as a unique key (could be the Google Drive file ID or a hash of the videoUrl)
  const videoId = videoUrl ? encodeURIComponent(videoUrl) : null;

  // Function to load comments from API
  const loadComments = async () => {
    if (!videoId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${videoId}`);
      const data = await res.json();
      if (Array.isArray(data.comments)) {
        setComments(data.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!videoId) {
      setComments([]);
      setLoading(false);
      return;
    }
    loadComments();
  }, [videoId]);

  // Poll for updates every 5 seconds
  useEffect(() => {
    if (!videoId) return;
    const pollInterval = setInterval(loadComments, 5000);
    return () => clearInterval(pollInterval);
  }, [videoId]);

  // Save comments to API when changed
  useEffect(() => {
    if (!videoId || loading) return;
    const saveComments = async () => {
      await fetch(`/api/comments/${videoId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comments }),
        }
      );
    };
    saveComments();
  }, [comments, videoId, loading]);

  const addComment = (comment) => {
    const newComment = {
      ...comment,
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
