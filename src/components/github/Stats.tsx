import { CountUp } from "@/components/motion/CountUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import type { GitHubTracker } from "@/lib/github";

export function Stats({ tracker }: { tracker: GitHubTracker }) {
  const items = [
    { label: "contributions ytd", value: tracker.total },
    { label: "last 7 days", value: tracker.lastWeek },
    { label: "longest streak", value: tracker.longestStreak, suffix: "d" },
    { label: "best day", value: tracker.bestDay.count },
  ];

  return (
    <Stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-3 bg-ink-3 sm:grid-cols-4">
      {items.map((item) => (
        <StaggerItem key={item.label} className="bg-ink-1 p-4">
          <div className="font-medium text-2xl text-ash-3 tabular-nums tracking-tight">
            <CountUp to={item.value} suffix={item.suffix ?? ""} />
          </div>
          <div className="mt-1 font-mono text-[11px] text-ash-1">{item.label}</div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
