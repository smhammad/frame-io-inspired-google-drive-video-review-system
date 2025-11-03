import { useEffect, useState, useRef } from "react";
import { CommentSync } from "../utils/commentSync.jsx";

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
    let isActive = true; // Flag to prevent updates after unmount

    const initializeSync = async () => {
      if (!videoUrl) {
        safeSetComments([]);
        setLoading(false);
        return;
      }

      try {
        // Create new sync instance
        const sync = new CommentSync(videoUrl);
        
        // Set up update handler with debounce
        let updateTimeout;
        sync.onUpdate = (newComments) => {
          if (!isActive) return;
          
          // Clear any pending update
          if (updateTimeout) clearTimeout(updateTimeout);
          
          // Debounce updates by 100ms
          updateTimeout = setTimeout(() => {
            console.log('[useComments] Received sync update');
            setComments(prev => {
              // Only update if we have new comments or empty array
              if (!Array.isArray(newComments)) return prev;
              if (prev.length === 0) return newComments;
              if (newComments.length === 0) return prev;
              
              // Merge comments, keeping the most recent version of each
              const merged = [...prev];
              newComments.forEach(newComment => {
                const index = merged.findIndex(c => c.id === newComment.id);
                if (index === -1) {
                  merged.push(newComment);
                } else if (newComment.createdAt > merged[index].createdAt) {
                  merged[index] = newComment;
                }
              });
              return merged;
            });
          }, 100);
        };

        syncRef.current = sync;

        // Load initial comments
        const initialComments = await sync.init();
        if (!isActive) return;

        safeSetComments(Array.isArray(initialComments) ? initialComments : []);
      } catch (err) {
        console.error('Failed to initialize comments:', err);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    initializeSync();

    // Cleanup
    return () => {
      isActive = false;
      if (syncRef.current) {
        syncRef.current.destroy();
        syncRef.current = null;
      }
    };

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
