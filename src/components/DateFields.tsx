import { MONTHS } from "@/lib/types";

export function MonthDayFields({
  label,
  monthName,
  dayName,
  required,
  defaultMonth,
  defaultDay,
}: {
  label: string;
  monthName: string;
  dayName: string;
  required?: boolean;
  defaultMonth?: number | null;
  defaultDay?: number | null;
}) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <fieldset>
      <legend className="font-body text-sm text-ink-on-paper/70 mb-2">
        {label}
        {required && <span className="text-ember"> *</span>}
      </legend>
      <div className="flex gap-3">
        <select
          name={monthName}
          required={required}
          defaultValue={defaultMonth ?? ""}
          className="flex-1 rounded-lg border border-paper-dim bg-paper px-3 py-2 font-body text-ink-on-paper"
        >
          <option value="" disabled>
            Month
          </option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          name={dayName}
          required={required}
          defaultValue={defaultDay ?? ""}
          className="w-24 rounded-lg border border-paper-dim bg-paper px-3 py-2 font-body text-ink-on-paper"
        >
          <option value="" disabled>
            Day
          </option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
