import ScrollArea from "./ui/scroll-area";
import Separator from "./ui/separator";
import CommentItem from "./CommentItem";
import Badge from "./ui/badge";
import { useState } from "react";

export default function CommentSidebar({ comments, onDelete, onSeek, onToggleResolved }) {
  const [showResolved, setShowResolved] = useState(true);
  
  const activeComments = comments.filter(c => !c.resolved);
  const resolvedComments = comments.filter(c => c.resolved);
  
  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft flex flex-col h-[70vh]">
      <div className="p-4 flex items-center justify-between">
        <div className="font-semibold">Comments</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`text-xs px-2 py-1 rounded transition ${
              showResolved 
                ? 'bg-green-950/30 text-green-500' 
                : 'bg-accent/30'
            }`}
          >
            {resolvedComments.length} Resolved
          </button>
          <Badge>{activeComments.length} Active</Badge>
        </div>
      </div>
      <Separator />
      <ScrollArea className="p-3 space-y-2 flex-1">
        {comments.length === 0 && (
          <div className="text-sm text-muted-foreground p-4">
            Pause the video to add a comment. A snapshot of the frame will be saved.
          </div>
        )}
        {activeComments.map((c, i) => (
          <CommentItem 
            key={`active-${i}`} 
            data={c} 
            onDelete={() => onDelete(i)} 
            onSeek={onSeek}
            onToggleResolved={() => onToggleResolved(i)}
          />
        ))}
        {showResolved && resolvedComments.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="text-xs text-muted-foreground mb-2">
              Resolved Comments
            </div>
            {resolvedComments.map((c, i) => (
              <CommentItem 
                key={`resolved-${i}`}
                data={c} 
                onDelete={() => onDelete(comments.indexOf(c))}
                onSeek={onSeek}
                onToggleResolved={() => onToggleResolved(comments.indexOf(c))}
              />
            ))}
          </>
        )}
      </ScrollArea>
    </div>
  );
}
