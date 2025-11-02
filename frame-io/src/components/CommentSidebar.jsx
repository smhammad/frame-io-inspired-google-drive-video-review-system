import ScrollArea from "./ui/scroll-area";
import Separator from "./ui/separator";
import CommentItem from "./CommentItem";
import Badge from "./ui/badge";

export default function CommentSidebar({ comments, onDelete, onSeek }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft flex flex-col h-[70vh]">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">Comments</div>
        <Badge>{comments.length} notes</Badge>
      </div>
      <Separator />
      <ScrollArea className="p-3 space-y-2 flex-1">
        {comments.length === 0 && (
          <div className="text-sm text-muted-foreground p-4">
            Pause the video to add a comment. A snapshot of the frame will be saved.
          </div>
        )}
        {comments.map((c, i) => (
          <CommentItem key={i} data={c} onDelete={() => onDelete(i)} onSeek={onSeek} />
        ))}
      </ScrollArea>
    </div>
  );
}
