import { useRef, useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import Button from "./components/ui/button";
import Input from "./components/ui/input";
import ScrollArea from "./components/ui/scroll-area";
import Separator from "./components/ui/separator";
import { Film, Download, Trash2 } from "lucide-react";

import LinkInput from "./components/LinkInput";
import VideoPlayer from "./components/VideoPlayer";
import CommentSidebar from "./components/CommentSidebar";
import TimelineMarkers from "./components/TimelineMarkers";
import ExportButton from "./components/ExportButton";
import useComments from "./hooks/useComments";
import { encodeShare, decodeShare } from "./utils/shareUtils";
import ShareModal from "./components/ShareModal";

export default function App() {
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(1);
  const { comments, addComment, deleteComment, exportComments, clearAll } = useComments();
  const [shareUrl, setShareUrl] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);

  // If the app is opened with a share payload, load the video and comments
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('share');
      if (!s) return;
      const payload = decodeShare(s);
      if (!payload) return;
      if (payload.videoUrl) setVideoUrl(payload.videoUrl);
      if (Array.isArray(payload.comments) && payload.comments.length) {
        // replace existing comments with shared ones
        clearAll();
        payload.comments.forEach((c) => addComment(c));
      }
    } catch (err) {
      console.warn('failed to load share payload', err);
    }
  }, []);

  const seek = (t) => {
    const v = videoRef.current;
    if (!v) return;
    console.debug('[App] seek requested to', t, 'videoRef=', videoRef.current);
    v.currentTime = t;
    v.pause();
  };

  const headerRight = useMemo(() => (
    <div className="flex items-center gap-2">
      <ExportButton comments={comments} exportComments={exportComments} />
      {videoUrl && (
        <Button
          variant="ghost"
          onClick={() => {
            try {
              const payload = {
                videoUrl,
                comments: comments.map((c) => ({ time: c.time, text: c.text }))
              };
              const code = encodeShare(payload);
              if (!code) throw new Error('encoding failed');
              const url = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(code)}`;
              setShareUrl(url);
              setShareOpen(true);
            } catch (err) {
              console.error('failed to generate share link', err);
              alert('Failed to generate share link');
            }
          }}
        >
          Share
        </Button>
      )}
      <Button variant="ghost" onClick={clearAll} title="Clear local comments">
        <Trash2 className="w-4 h-4 mr-2" /> Clear
      </Button>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} url={shareUrl} />
    </div>
  ), [comments, videoUrl, shareOpen, shareUrl]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border backdrop-blur bg-background/70">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 grid place-items-center">
              <Film className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">Drive Review Tool</div>
              <div className="text-xs text-muted-foreground">Paste Drive link → comment → export</div>
            </div>
          </div>
          {headerRight}
        </div>
      </header>

      <main className="container mx-auto py-6">
        <Card className="border border-border">
          <CardHeader className="flex flex-col gap-3">
            <LinkInput onLoad={setVideoUrl} />
          </CardHeader>

          {videoUrl ? (
            <CardContent className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8 space-y-4">
                <VideoPlayer
                  ref={videoRef}
                  videoUrl={videoUrl}
                  onAddComment={addComment}
                  onDuration={setDuration}
                />
                <TimelineMarkers
                  comments={comments}
                  duration={duration || 1}
                  onSeek={seek}
                />
              </div>

              <div className="col-span-12 lg:col-span-4">
                <CommentSidebar
                  comments={comments}
                  onDelete={deleteComment}
                  onSeek={seek}
                />
              </div>
            </CardContent>
          ) : (
            <CardContent className="py-16 grid place-items-center text-center">
              <div className="max-w-xl opacity-90">
                <h2 className="text-2xl font-semibold mb-2">Drop a Google Drive link to start</h2>
                <p className="text-muted-foreground">
                  We stream directly from Drive. Your browser stores comments locally. Export to CSV when done.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  );
}
