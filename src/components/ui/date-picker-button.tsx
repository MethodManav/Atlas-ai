"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerButtonProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string; // YYYY-MM-DD
  className?: string;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function formatDisplay(iso: string): string {
  if (!iso) return "Select date";
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DatePickerButton({
  value,
  onChange,
  minDate,
  className,
}: DatePickerButtonProps) {
  const [open, setOpen] = useState(false);
  const initialDate = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const today = new Date();
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());
  const grid = buildGrid(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }
  function selectDay(day: number) {
    onChange(toIso(viewYear, viewMonth, day));
    setOpen(false);
  }
  function isDayDisabled(day: number) {
    return !!minDate && toIso(viewYear, viewMonth, day) < minDate;
  }
  function isDaySelected(day: number) {
    return toIso(viewYear, viewMonth, day) === value;
  }
  function isDayToday(day: number) {
    return toIso(viewYear, viewMonth, day) === todayIso;
  }

  return (
    <Popover.Root open={open} onOpenChange={(o) => setOpen(o)} modal={false}>
      <Popover.Trigger
        className={cn(
          "flex items-center gap-1.5 h-10 px-3 rounded-xl border border-white/10 bg-zinc-800/60",
          "text-sm font-medium text-zinc-300 w-full",
          "hover:border-violet-500/40 hover:bg-zinc-800",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
          "transition-all duration-150",
          open && "border-violet-500/40 bg-zinc-800",
          className,
        )}
      >
        <CalendarDays className="w-4 h-4 text-violet-400 flex-shrink-0" />
        <span className="flex-1 text-left">{formatDisplay(value)}</span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={6}>
          <Popover.Popup className="animate-atlas-calendar-pop bg-zinc-900 rounded-2xl shadow-2xl shadow-black/60 border border-white/8 p-3 w-[280px] z-50 select-none">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-zinc-200">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="w-8 h-6 flex items-center justify-center text-[10px] font-semibold text-zinc-600">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {grid.map((row, ri) => (
              <div key={ri} className="grid grid-cols-7">
                {row.map((day, ci) => {
                  if (day === null) return <div key={ci} className="w-8 h-8" />;
                  const disabled = isDayDisabled(day);
                  const selected = isDaySelected(day);
                  const isToday = isDayToday(day);
                  return (
                    <button
                      key={ci}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && selectDay(day)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-colors duration-100",
                        selected
                          ? "bg-violet-600 text-white shadow-sm shadow-violet-900/50"
                          : disabled
                          ? "text-zinc-700 cursor-not-allowed"
                          : isToday
                          ? "ring-1 ring-violet-500/50 text-violet-400 font-semibold hover:bg-violet-950/60"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ))}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
