import { useEffect, useState, useRef } from "react";
import { CommentSync } from "../utils/commentSync";

export default function useComments(videoUrl) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const syncRef = useRef(null);

  // Safe setter for comments that ensures array type
  const safeSetComments = (newComments) => {
    if (Array.isArray(newComments)) {
      setComments(newComments);
    } else {
      console.warn('Attempted to set non-array comments:', newComments);
      setComments([]);
    }
  };

  // Initialize comment sync
  useEffect(() => {
    if (!videoUrl) {
      safeSetComments([]);
      setLoading(false);
      return;
    }

    // Create new sync instance
    const sync = new CommentSync(videoUrl);
    syncRef.current = sync;

    // Set up update handler
    sync.onUpdate = (newComments) => {
      console.log('[useComments] Received sync update');
      safeSetComments(Array.isArray(newComments) ? newComments : []);
    };

    // Load initial comments
    const initialComments = sync.init();
    safeSetComments(Array.isArray(initialComments) ? initialComments : []);
    setLoading(false);

    // Cleanup
    return () => {
      sync.destroy();
      syncRef.current = null;
    };
  }, [videoUrl]);

  // Sync comments when they change locally
  useEffect(() => {
    if (!loading && syncRef.current) {
      syncRef.current.updateComments(comments);
    }
  }, [comments, loading]);

  const addComment = async (comment) => {
    // Remove image data if present to avoid storage issues
    const { image, ...commentWithoutImage } = comment;
    
    const newComment = {
      ...commentWithoutImage,
      resolved: false,
      createdAt: new Date().toISOString(),
      id: Date.now().toString(), // Add unique ID for reliable updates
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
