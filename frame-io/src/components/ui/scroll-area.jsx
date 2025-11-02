import { cn } from "../../lib/utils";
export default function ScrollArea({ className, children, ...props }) {
  return (
    <div className={cn("overflow-y-auto", className)} {...props}>
      {children}
    </div>
  );
}
