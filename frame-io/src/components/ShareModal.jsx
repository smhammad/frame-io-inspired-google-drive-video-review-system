import Button from "./ui/button";

export default function ShareModal({ open, onClose, url }) {
  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    } catch (err) {
      console.error('copy failed', err);
      alert('Failed to copy link');
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="bg-card rounded-lg p-6 w-[min(900px,90%)]">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">Shareable link</div>
          <div>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="mb-4">
          <input readOnly value={url} className="w-full p-2 rounded border border-border bg-muted/5 text-sm" />
        </div>

        <div className="flex gap-2 justify-end">
          <Button onClick={() => window.open(url, '_blank')}>Open</Button>
          <Button onClick={handleCopy}>Copy</Button>
        </div>
      </div>
    </div>
  );
}
