"use client";

import { useMemo, useState } from "react";
import { dayOfYear, monthName, ordinal, type Profile } from "@/lib/types";

const DAYS_IN_YEAR = 365;
const SIZE = 560;
const CENTER = SIZE / 2;
const RING_R = 220;

function angleFor(doy: number) {
  // Start at 12 o'clock, go clockwise.
  return (doy / DAYS_IN_YEAR) * 360 - 90;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

type Point = {
  profile: Profile;
  kind: "birthday" | "anniversary";
  doy: number;
};

export default function YearWheel({ profiles }: { profiles: Profile[] }) {
  const [active, setActive] = useState<Point | null>(null);

  const points: Point[] = useMemo(() => {
    const pts: Point[] = [];
    for (const p of profiles) {
      pts.push({
        profile: p,
        kind: "birthday",
        doy: dayOfYear(p.birth_month, p.birth_day),
      });
      if (p.anniversary_month && p.anniversary_day) {
        pts.push({
          profile: p,
          kind: "anniversary",
          doy: dayOfYear(p.anniversary_month, p.anniversary_day),
        });
      }
    }
    return pts;
  }, [profiles]);

  const todayDoy = useMemo(() => {
    const now = new Date();
    return dayOfYear(now.getMonth() + 1, now.getDate());
  }, []);

  const monthTicks = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="relative w-full flex flex-col items-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[560px] h-auto"
        role="img"
        aria-label="Wheel of the fellowship's birthdays and anniversaries through the year"
      >
        {/* base ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RING_R}
          fill="none"
          stroke="var(--panel-raised)"
          strokeWidth={1.5}
        />

        {/* month ticks + labels */}
        {monthTicks.map((m) => {
          const doy = dayOfYear(m + 1, 1);
          const ang = angleFor(doy);
          const inner = polar(CENTER, CENTER, RING_R - 8, ang);
          const outer = polar(CENTER, CENTER, RING_R + 8, ang);
          const label = polar(CENTER, CENTER, RING_R + 30, ang);
          return (
            <g key={m}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--sage)"
                strokeWidth={1}
                opacity={0.5}
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-data"
                fontSize={11}
                fill="var(--sage)"
              >
                {monthName(m + 1).slice(0, 3).toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* today marker */}
        <line
          x1={CENTER}
          y1={CENTER}
          x2={polar(CENTER, CENTER, RING_R + 14, angleFor(todayDoy)).x}
          y2={polar(CENTER, CENTER, RING_R + 14, angleFor(todayDoy)).y}
          stroke="var(--ember)"
          strokeWidth={1.5}
          strokeDasharray="2 3"
        />
        <circle
          cx={polar(CENTER, CENTER, RING_R + 14, angleFor(todayDoy)).x}
          cy={polar(CENTER, CENTER, RING_R + 14, angleFor(todayDoy)).y}
          r={3.5}
          fill="var(--ember)"
        />

        {/* member points */}
        {points.map((pt, i) => {
          const ang = angleFor(pt.doy);
          const pos = polar(CENTER, CENTER, RING_R, ang);
          const isActive = active?.profile.id === pt.profile.id && active?.kind === pt.kind;
          const color = pt.kind === "birthday" ? "var(--marigold)" : "var(--sage)";
          return (
            <circle
              key={`${pt.profile.id}-${pt.kind}-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={isActive ? 6 : 4}
              fill={color}
              stroke="var(--ink)"
              strokeWidth={1}
              className="cursor-pointer transition-[r]"
              onMouseEnter={() => setActive(pt)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(pt)}
              onBlur={() => setActive(null)}
              tabIndex={0}
              role="button"
              aria-label={`${pt.profile.full_name}, ${pt.kind} ${monthName(
                pt.kind === "birthday" ? pt.profile.birth_month : pt.profile.anniversary_month!,
              )} ${pt.kind === "birthday" ? pt.profile.birth_day : pt.profile.anniversary_day}`}
            />
          );
        })}

        {/* center label */}
        <text
          x={CENTER}
          y={CENTER - 6}
          textAnchor="middle"
          className="font-display"
          fontSize={20}
          fill="var(--cream)"
        >
          The Circle
        </text>
        <text
          x={CENTER}
          y={CENTER + 16}
          textAnchor="middle"
          className="font-data"
          fontSize={11}
          fill="var(--sage)"
        >
          {points.length} dates kept
        </text>
      </svg>

      <div className="h-14 flex items-center justify-center text-center px-4">
        {active ? (
          <p className="font-body text-cream">
            <span className="font-semibold">{active.profile.full_name}</span>
            <span className="text-sage">
              {" — "}
              {active.kind === "birthday" ? "birthday" : "anniversary"}{" "}
              {ordinal(
                active.kind === "birthday"
                  ? active.profile.birth_day
                  : active.profile.anniversary_day!,
              )}{" "}
              {monthName(
                active.kind === "birthday"
                  ? active.profile.birth_month
                  : active.profile.anniversary_month!,
              )}
            </span>
          </p>
        ) : (
          <p className="font-data text-sage text-sm">
            hover or tab through a point — the dashed line marks today
          </p>
        )}
      </div>
    </div>
  );
}
