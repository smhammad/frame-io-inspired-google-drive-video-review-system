import { useEffect, useState } from "react";

const STORAGE_KEY = "drive-review-comments-v1";

export default function useComments() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const saved = JSON.parse(raw);
      if (Array.isArray(saved)) setComments(saved);
      else setComments([]);
    } catch (err) {
      console.warn('[useComments] failed to read saved comments, resetting to empty', err);
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      setComments([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    } catch (err) {
      // Likely quota exceeded due to base64 thumbnails. Try to persist without images as a fallback.
      try {
        console.warn('[useComments] localStorage write failed, stripping images and retrying', err);
        const stripped = comments.map((c) => ({ ...c, image: undefined }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
      } catch (err2) {
        console.error('[useComments] persistent storage failed', err2);
        // Last resort: don't block app; continue without persisting
      }
    }
  }, [comments]);

  // debug: log when comments are added
  const addComment = (c) => {
    try { console.debug('[useComments] addComment', c); } catch {}
    setComments((prev) => [...prev, c]);
  };
  const deleteComment = (i) => setComments((prev) => prev.filter((_, idx) => idx !== i));
  const clearAll = () => setComments([]);

  const exportComments = (rows) => {
    const header = "timestamp_seconds,timestamp_hhmmss,comment\n";
    const body = rows
      .map((c) => `${c.time.toFixed(2)},${toHHMMSS(c.time)},"${escapeCsv(c.text)}"`)
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

  return { comments, addComment, deleteComment, exportComments, clearAll };
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
