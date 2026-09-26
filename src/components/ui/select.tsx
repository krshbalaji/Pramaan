import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-[var(--radius-sm)] border border-border bg-input px-3 text-sm text-fg",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
