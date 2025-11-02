import { cn } from "../../lib/utils";
export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full h-11 rounded-xl bg-accent/30 border border-border px-3 outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/70",
        className
      )}
      {...props}
    />
  );
}
