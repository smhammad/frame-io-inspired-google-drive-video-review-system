import { forwardRef, useEffect, useRef, useState } from "react";

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
    const text = prompt("Add a comment for this frame:");
    if (!text) return;

  // capture frame to base64 jpeg
  const canvas = document.createElement("canvas");
  // scale down large videos and cap max width to keep thumbnails small for localStorage
  const preferredScale = 0.5;
  const maxWidth = 640; // cap width to ~640px
  const rawWidth = Math.max(1, Math.floor(video.videoWidth * preferredScale));
  const width = Math.min(rawWidth, maxWidth);
  const height = Math.max(1, Math.floor((video.videoHeight * width) / video.videoWidth));
  canvas.width = width;
  canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  // lower quality to reduce size further
    let image = null;
    try {
      image = canvas.toDataURL("image/jpeg", 0.7);
    } catch (err) {
      // Canvas may be tainted due to cross-origin video; fall back to saving comment without image
      console.warn('[VideoPlayer] failed to export canvas image (canvas may be tainted):', err);
      image = undefined;
      // show a simple alert to inform the user once
      try { alert('Snapshot blocked by cross-origin restrictions. Comment will be saved without an image. Use the local proxy or enable public sharing in Drive to allow snapshots.'); } catch {}
    }

    const comment = {
      time: video.currentTime,
      text,
      image
    };
    console.debug('[VideoPlayer] adding comment', comment);
    onAddComment?.(comment);
  };

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
