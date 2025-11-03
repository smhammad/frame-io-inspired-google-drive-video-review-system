import Button from "./ui/button";

function toHHMMSS(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function CommentItem({ data, onDelete, onSeek, onToggleResolved }) {
  return (
    <div className={`border border-border/60 rounded-xl p-3 ${
      data.resolved 
        ? 'bg-green-950/30 hover:bg-green-950/50' 
        : 'bg-accent/30 hover:bg-accent/50'
    } transition`}>
      <div className="flex gap-3">
        <div
          className={`w-24 h-16 rounded-lg cursor-pointer flex items-center justify-center bg-black/40 ${
            data.resolved ? 'opacity-70' : ''
          }`}
          onClick={() => onSeek(data.time)}
        >
          <span className="text-sm font-mono opacity-75">
            {toHHMMSS(data.time)}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TimeBadge time={data.time} onClick={() => onSeek(data.time)} />
            {data.resolved && (
              <span className="text-xs text-green-500 font-medium">
                Resolved
              </span>
            )}
          </div>
          <div className={`text-sm leading-snug ${
            data.resolved ? 'line-through opacity-75' : 'opacity-95'
          }`}>
            {data.text}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onToggleResolved(data)}
          >
            {data.resolved ? 'Unresolve' : 'Resolve'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimeBadge({ time, onClick }) {
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  const label = `${m}:${s < 10 ? "0"+s : s}`;
  return (
    <button
      onClick={onClick}
      className="text-xs font-mono px-2 py-1 rounded-lg bg-black/60 border border-border hover:bg-black/80"
    >
      {label}
    </button>
  );
}
