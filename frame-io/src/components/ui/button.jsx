import { cn } from "../../lib/utils";

export default function Button({ asChild, className, variant="default", size="md", ...props }) {
  const base = "inline-flex items-center justify-center whitespace-nowrap font-medium transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-primary text-black hover:opacity-90 shadow-soft",
    ghost: "bg-transparent hover:bg-accent/40 border border-border",
    outline: "border border-border hover:bg-accent/30",
    subtle: "bg-accent/50 hover:bg-accent/70"
  };
  const sizes = {
    md: "h-10 px-4 rounded-xl",
    sm: "h-8 px-3 rounded-lg text-sm",
    lg: "h-12 px-6 rounded-xl text-lg"
  };
  const Comp = asChild ? "span" : "button";
  return <Comp className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
