import { describe, expect, it } from "vitest";
import type { PlayEvent, Track } from "./spotify";
import { dayKey, foldPlays, mergeScores, playlistId, topN, windowDays } from "./spotify";

describe("dayKey", () => {
  it("returns the UTC calendar day", () => {
    expect(dayKey(Date.UTC(2026, 7, 18, 13, 30))).toBe("2026-08-18");
  });

  it("does not roll forward on a late-UTC timestamp", () => {
    expect(dayKey(Date.UTC(2026, 7, 18, 23, 59, 59))).toBe("2026-08-18");
  });

  it("rolls over exactly at midnight UTC", () => {
    expect(dayKey(Date.UTC(2026, 7, 19, 0, 0, 0))).toBe("2026-08-19");
  });
});

describe("windowDays", () => {
  const now = Date.UTC(2026, 7, 18, 12, 0, 0);

  it("returns seven days, newest first", () => {
    expect(windowDays(now)).toEqual([
      "2026-08-18",
      "2026-08-17",
      "2026-08-16",
      "2026-08-15",
      "2026-08-14",
      "2026-08-13",
      "2026-08-12",
    ]);
  });

  it("produces no duplicates", () => {
    const days = windowDays(now);
    expect(new Set(days).size).toBe(days.length);
  });

  it("crosses a month boundary without gaps", () => {
    expect(windowDays(Date.UTC(2026, 8, 2, 6, 0, 0))).toEqual([
      "2026-09-02",
      "2026-09-01",
      "2026-08-31",
      "2026-08-30",
      "2026-08-29",
      "2026-08-28",
      "2026-08-27",
    ]);
  });

  it("crosses a year boundary without gaps", () => {
    expect(windowDays(Date.UTC(2027, 0, 2, 6, 0, 0))).toEqual([
      "2027-01-02",
      "2027-01-01",
      "2026-12-31",
      "2026-12-30",
      "2026-12-29",
      "2026-12-28",
      "2026-12-27",
    ]);
  });

  it("stays inside the 8-day retention that the TTL enforces", () => {
    expect(windowDays(now).length).toBeLessThan(8);
  });
});

// --- ingest folding ---------------------------------------------------------

const track = (id: string): Track => ({
  id,
  name: `Track ${id}`,
  artist: "Someone",
  url: `https://open.spotify.com/track/${id}`,
  art: null,
});

const play = (playedAt: number, id: string): PlayEvent => ({
  playedAt,
  track: track(id),
  artist: { id: `artist-${id}`, name: "Someone", url: "https://x", art: null },
  playlist: null,
});

describe("foldPlays", () => {
  const t0 = Date.UTC(2026, 7, 18, 10, 0, 0);

  it("buckets plays by UTC day", () => {
    const { days } = foldPlays([play(t0, "a"), play(t0 + 86_400_000, "b")], 0);
    expect([...days.keys()].sort()).toEqual(["2026-08-18", "2026-08-19"]);
  });

  it("advances the cursor to the newest play seen", () => {
    const { newest } = foldPlays([play(t0, "a"), play(t0 + 5000, "b")], 0);
    expect(newest).toBe(t0 + 5000);
  });

  it("is idempotent — re-running with the returned cursor ingests nothing", () => {
    const items = [play(t0, "a"), play(t0 + 5000, "b")];
    const first = foldPlays(items, 0);
    const second = foldPlays(items, first.newest);

    expect(second.days.size).toBe(0);
    expect(second.newest).toBe(first.newest);
  });

  it("ingests only the genuinely new tail on an overlapping re-fetch", () => {
    const first = foldPlays([play(t0, "a"), play(t0 + 1000, "b")], 0);
    const overlapping = [play(t0, "a"), play(t0 + 1000, "b"), play(t0 + 2000, "c")];
    const second = foldPlays(overlapping, first.newest);

    expect([...second.days.values()].flat().map((p) => p.track.id)).toEqual(["c"]);
  });

  it("drops plays at exactly the cursor, not just below it", () => {
    const { days } = foldPlays([play(t0, "a")], t0);
    expect(days.size).toBe(0);
  });

  it("keeps repeat listens of the same track as separate plays", () => {
    const { days } = foldPlays([play(t0, "a"), play(t0 + 1000, "a")], 0);
    expect(days.get("2026-08-18")).toHaveLength(2);
  });

  it("returns an empty result for no input", () => {
    const { days, newest } = foldPlays([], 42);
    expect(days.size).toBe(0);
    expect(newest).toBe(42);
  });
});

// --- read merging -----------------------------------------------------------

describe("playlistId", () => {
  it("extracts the id from a playlist context", () => {
    expect(playlistId({ type: "playlist", uri: "spotify:playlist:4bmHZ3DJ6u9gGSFF0KshTX" })).toBe(
      "4bmHZ3DJ6u9gGSFF0KshTX",
    );
  });

  it("ignores a non-playlist context", () => {
    expect(playlistId({ type: "album", uri: "spotify:album:1PU4Y8bYmZwCJRwvcbtaFy" })).toBeNull();
  });

  it("returns null when the play carried no context", () => {
    expect(playlistId(null)).toBeNull();
    expect(playlistId(undefined)).toBeNull();
  });

  it("returns null rather than an empty id for a truncated uri", () => {
    expect(playlistId({ type: "playlist", uri: "spotify:playlist:" })).toBeNull();
  });
});

describe("mergeScores", () => {
  it("sums a member's score across day buckets", () => {
    const totals = mergeScores([
      ["a", 3, "b", 1],
      ["a", 2, "c", 5],
    ]);
    expect(totals.get("a")).toBe(5);
    expect(totals.get("b")).toBe(1);
    expect(totals.get("c")).toBe(5);
  });

  it("tolerates empty day keys", () => {
    expect(mergeScores([[], ["a", 1], []]).get("a")).toBe(1);
  });

  it("coerces string scores, as the REST client returns them", () => {
    expect(
      mergeScores([
        ["a", "2"],
        ["a", "3"],
      ]).get("a"),
    ).toBe(5);
  });

  it("returns an empty map when every day is empty", () => {
    expect(mergeScores([[], []]).size).toBe(0);
  });
});

describe("topN", () => {
  const totals = new Map([
    ["a", 1],
    ["b", 9],
    ["c", 5],
  ]);

  it("orders by descending play count", () => {
    expect(topN(totals, 3).map(([id]) => id)).toEqual(["b", "c", "a"]);
  });

  it("caps at the limit", () => {
    expect(topN(totals, 2)).toHaveLength(2);
  });

  it("returns everything when the limit exceeds the set", () => {
    expect(topN(totals, 99)).toHaveLength(3);
  });
});
