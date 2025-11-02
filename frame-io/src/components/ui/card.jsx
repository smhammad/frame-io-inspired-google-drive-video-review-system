import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("bg-card text-card-foreground rounded-2xl shadow-soft border border-border", className)} {...props} />;
}
export function CardHeader({ className, ...props }) {
  return <div className={cn("p-4 sm:p-6 border-b border-border", className)} {...props} />;
}
export function CardContent({ className, ...props }) {
  return <div className={cn("p-4 sm:p-6", className)} {...props} />;
}
export function CardFooter({ className, ...props }) {
  return <div className={cn("p-4 sm:p-6 border-t border-border", className)} {...props} />;
}
