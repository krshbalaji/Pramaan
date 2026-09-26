import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & { tone?: "neutral" | "success" | "warn" | "danger" | "accent" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        tone === "neutral" && "bg-bg-subtle text-fg-muted",
        tone === "success" && "bg-calc text-success",
        tone === "warn" && "bg-input text-warn",
        tone === "danger" && "bg-[#f4e4e1] text-danger",
        tone === "accent" && "bg-[#e4ebf5] text-accent",
        className,
      )}
      {...props}
    />
  );
}
