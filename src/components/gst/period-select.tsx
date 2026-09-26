import { gstPeriodOptions } from "@/lib/gst/engine";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function PeriodSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (period: string) => void;
}) {
  return (
    <div className="w-full max-w-xs">
      <Label>Return period</Label>
      <Select className="mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
        {gstPeriodOptions().map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
