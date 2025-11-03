import { forwardRef, useEffect, useRef, useState } from "react";
import CommentEditor from "./CommentEditor";

/**
 * Exposes native <video> ref to parent via forwardRef.
 * onAddComment({ time, text, image })
 * onDuration(number)
 */
const VideoPlayer = forwardRef(function VideoPlayer({ videoUrl, onAddComment, onDuration }, refFromParent) {
  const innerRef = useRef(null);
  const [loadError, setLoadError] = useState(null);

  // bridge ref
  useEffect(() => {
    if (typeof refFromParent === "function") refFromParent(innerRef.current);
    else if (refFromParent) refFromParent.current = innerRef.current;
  }, [refFromParent]);

  useEffect(() => {
    const v = innerRef.current;
    if (!v) return;
    const handleLoaded = () => onDuration?.(v.duration || 1);
    v.addEventListener("loadedmetadata", handleLoaded);
    return () => v.removeEventListener("loadedmetadata", handleLoaded);
  }, [videoUrl]);

  // Reset error when url changes
  useEffect(() => {
    setLoadError(null);
  }, [videoUrl]);

  // Try to surface network/CORS errors and provide helpful debug info
  const handleError = async (e) => {
    setLoadError({ message: "Failed to load video." });

    // Try a lightweight HEAD request to inspect headers (may be blocked by CORS)
    try {
      const res = await fetch(videoUrl, { method: "HEAD", mode: "cors" });
      setLoadError((prev) => ({
        ...prev,
        status: res.status,
        ok: res.ok,
        type: res.headers.get("content-type") || null,
        acceptRanges: res.headers.get("accept-ranges") || null,
      }));
    } catch (err) {
      setLoadError((prev) => ({ ...prev, fetchError: String(err) }));
    }
  };

  const handlePause = async () => {
    const video = innerRef.current;
    if (!video) return;
    console.debug('[VideoPlayer] pause event, currentTime=', video.currentTime);

    // Disabled snapshot feature to save storage and improve sharing
    setEditorState({ 
      open: true, 
      time: video.currentTime, 
      image: undefined 
    });
  };

  const [editorState, setEditorState] = useState({ open: false, time: 0, image: undefined });
  const [savedToast, setSavedToast] = useState(false);

  const handleEditorSave = (c) => {
    // c: { time, text, image }
    console.debug('[VideoPlayer] editor save', c);
    onAddComment?.(c);
    setEditorState({ open: false, time: 0, image: undefined });
    // show quick confirmation
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  const handleEditorCancel = () => setEditorState({ open: false, time: 0, image: undefined });

  return (
    <div className="relative">
      <video
        ref={innerRef}
        controls
        playsInline
        crossOrigin="anonymous"
        src={videoUrl}
        onPause={handlePause}
        onError={handleError}
        className="w-full rounded-xl2 border border-border shadow-soft"
        style={{ aspectRatio: "16 / 9", background: "linear-gradient(180deg,#0f131a,#0b0b0d)" }}
      />

      <CommentEditor open={editorState.open} time={editorState.time} image={editorState.image} onSave={handleEditorSave} onCancel={handleEditorCancel} />

      {/* simple saved toast */}
      {savedToast && (
        <div className="absolute right-4 bottom-4 bg-green-600 text-white px-3 py-2 rounded shadow">
          Comment saved
        </div>
      )}

    {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4 text-center">
          <div className="mb-2 text-lg font-semibold">Unable to play this video</div>
          <div className="text-sm mb-3">{loadError.message}</div>
          <div className="text-xs mb-3 break-words">{videoUrl}</div>
          <div className="text-xs mb-3">
            {loadError.fetchError ? (
              <div>Network/CORS error: {loadError.fetchError}</div>
            ) : (
              <div>
                HTTP: {loadError.status ?? "?"} • ok: {String(loadError.ok)} • type: {loadError.type ?? "?"}
                {loadError.acceptRanges ? ` • accept-ranges: ${loadError.acceptRanges}` : ""}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(videoUrl, "_blank")}
              className="px-3 py-1 rounded bg-white text-black text-sm"
            >
              Open link
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText?.(videoUrl)}
              className="px-3 py-1 rounded border border-white text-sm"
            >
              Copy URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer;
