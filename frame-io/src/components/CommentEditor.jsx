import Button from "./ui/button";

export default function CommentEditor({ open, time, image, onSave, onCancel }) {
  if (!open) return null;

  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  const label = `${m}:${s < 10 ? "0" + s : s}`;

  let textVal = "";
  const handleSave = () => {
    const el = document.getElementById('comment-editor-textarea');
    const text = el?.value || '';
    onSave({ time, text, image });
  };

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40">
      <div className="bg-card rounded-lg p-4 w-[min(700px,95%)]">
        <div className="flex items-start gap-4">
          {image ? (
            <img src={image} alt="thumb" className="w-36 h-24 object-cover rounded" />
          ) : (
            <div className="w-36 h-24 bg-muted/10 rounded grid place-items-center text-sm">No preview</div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-mono">Time: {label}</div>
              <div className="text-xs text-muted-foreground">Snapshot may be unavailable due to cross-origin restrictions.</div>
            </div>
            <textarea id="comment-editor-textarea" placeholder="Add a comment for this frame..." className="w-full h-28 p-2 border border-border rounded resize-none" />
            <div className="flex gap-2 justify-end mt-3">
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
