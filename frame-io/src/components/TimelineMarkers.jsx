export default function TimelineMarkers({ comments, duration, onSeek }) {
  return (
    <div className="select-none">
      <div className="relative h-2 bg-accent/60 rounded-full">
        {/* progress gradient accent */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 to-transparent pointer-events-none"></div>

        {comments.map((c, idx) => {
          const left = Math.max(0, Math.min(100, (c.time / duration) * 100));
          return (
            <button
              key={idx}
              className="absolute -top-[6px] w-3 h-3 rounded-full bg-primary shadow-soft hover:scale-125 transition"
              style={{ left: `${left}%` }}
              title={`Jump to ${formatTime(c.time)}`}
              onClick={() => onSeek(c.time)}
            />
          );
        })}
      </div>
      <div className="mt-2 text-xs text-muted-foreground flex justify-between">
        <span>0:00</span>
        <span>{formatTime(duration || 0)}</span>
      </div>
    </div>
  );
}

function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0"+s : s}`;
}
