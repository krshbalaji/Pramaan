import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5",
        className,
      )}
      {...props}
    />
  );
}
