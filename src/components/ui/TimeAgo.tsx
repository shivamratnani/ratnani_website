"use client";

import { useEffect, useState } from "react";

const DIVISIONS = [
  { limit: 60, unit: "second" as const, ms: 1_000 },
  { limit: 60, unit: "minute" as const, ms: 60_000 },
  { limit: 24, unit: "hour" as const, ms: 3_600_000 },
  { limit: 30, unit: "day" as const, ms: 86_400_000 },
  { limit: 12, unit: "month" as const, ms: 2_592_000_000 },
  { limit: Number.POSITIVE_INFINITY, unit: "year" as const, ms: 31_536_000_000 },
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relative(from: number, now: number): string {
  const delta = from - now;
  for (const { limit, unit, ms } of DIVISIONS) {
    if (Math.abs(delta) < limit * ms) return formatter.format(Math.round(delta / ms), unit);
  }
  return formatter.format(Math.round(delta / 31_536_000_000), "year");
}

/**
 * Relative timestamp, resolved on the client.
 *
 * "Now" is viewer-relative, so computing it during render would both be wrong
 * for cached output and trip Cache Components' prerender guard. Rendering the
 * absolute date on the server keeps it meaningful without JS.
 */
export function TimeAgo({
  value,
  className,
  prefix = "",
}: {
  value: string | number | Date;
  className?: string;
  prefix?: string;
}) {
  const timestamp = new Date(value).getTime();
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setLabel(relative(timestamp, Date.now()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [timestamp]);

  return (
    <time dateTime={new Date(timestamp).toISOString()} className={className}>
      {prefix}
      {label ?? new Date(timestamp).toISOString().slice(0, 10)}
    </time>
  );
}
