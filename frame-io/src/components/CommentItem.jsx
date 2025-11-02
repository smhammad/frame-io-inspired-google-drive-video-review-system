import Button from "./ui/button";

export default function CommentItem({ data, onDelete, onSeek }) {
  return (
    <div className="border border-border/60 rounded-xl p-3 bg-accent/30 hover:bg-accent/50 transition">
      <div className="flex gap-3">
        <img
          src={data.image}
          alt="frame"
          className="w-24 h-16 object-cover rounded-lg cursor-pointer"
          onClick={() => onSeek(data.time)}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <TimeBadge time={data.time} onClick={() => onSeek(data.time)} />
          </div>
          <div className="text-sm leading-snug opacity-95">{data.text}</div>
        </div>
        <div className="flex items-start">
          <Button variant="ghost" size="sm" onClick={onDelete}>Delete</Button>
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
