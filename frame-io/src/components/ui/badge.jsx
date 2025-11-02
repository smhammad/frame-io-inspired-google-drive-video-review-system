import { cn } from "../../lib/utils";
export default function Badge({ className, children, ...props }) {
  return (
    <span
      className={cn("text-xs px-2 py-1 rounded-lg bg-accent/70", className)}
      {...props}
    >
      {children}
    </span>
  );
}
