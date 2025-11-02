import { cn } from "../../lib/utils";
export default function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl bg-accent/30 border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/70",
        className
      )}
      {...props}
    />
  );
}
