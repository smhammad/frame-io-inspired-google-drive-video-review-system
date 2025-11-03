import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { ref, onValue, set, push, remove, update } from "firebase/database";
import { getDriveFileId } from "../utils/driveComments";


  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileId = getDriveFileId(videoUrl);

  // Listen for real-time updates from Firebase
  useEffect(() => {
    if (!fileId) {
      setComments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const commentsRef = ref(db, `comments/${fileId}`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const val = snapshot.val() || {};
      // Convert object to array with id
      const arr = Object.entries(val).map(([id, c]) => ({ ...c, id }));
      setComments(arr);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fileId]);


  // Add a new comment
  const addComment = async (comment) => {
    if (!fileId) return;
    const { image, ...commentWithoutImage } = comment;
    const newComment = {
      ...commentWithoutImage,
      resolved: false,
      createdAt: new Date().toISOString(),
    };
    const commentsRef = ref(db, `comments/${fileId}`);
    await push(commentsRef, newComment);
  };


  // Delete a comment by id
  const deleteComment = async (id) => {
    if (!fileId || !id) return;
    const commentRef = ref(db, `comments/${fileId}/${id}`);
    await remove(commentRef);
  };


  // Toggle resolved state by id
  const toggleResolved = async (id) => {
    if (!fileId || !id) return;
    const commentRef = ref(db, `comments/${fileId}/${id}`);
    const comment = comments.find((c) => c.id === id);
    if (!comment) return;
    await update(commentRef, { resolved: !comment.resolved });
  };


  // Remove all comments for this video
  const clearAll = async () => {
    if (!fileId) return;
    const commentsRef = ref(db, `comments/${fileId}`);
    await set(commentsRef, null);
  };

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
