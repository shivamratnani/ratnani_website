import { cacheLife } from "next/cache";
import { z } from "zod";
import { site } from "@/data/site";
import { requireEnv } from "./env";

const ENDPOINT = "https://api.github.com/graphql";

/**
 * The HTML fragment behind the profile page's contribution graph. GraphQL's
 * `contributionCalendar` runs roughly 4% under the profile (8,939 vs 9,297 on
 * 2026-09-25, short on nearly every day), so the calendar comes from here and
 * the GraphQL calendar is only the fallback if this markup stops parsing.
 */
const CONTRIBUTIONS_URL = (login: string) => `https://github.com/users/${login}/contributions`;

/**
 * One query answers the whole tracker: calendar, pinned repos, and languages.
 * Streaks are derived from the calendar rather than fetched separately.
 */
const QUERY = /* GraphQL */ `
  query Tracker($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount contributionLevel }
          }
        }
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            forkCount
            pushedAt
            primaryLanguage { name }
          }
        }
      }
      repositories(first: 100, isFork: false, ownerAffiliations: OWNER, privacy: PUBLIC) {
        nodes { languages(first: 10) { edges { size node { name } } } }
      }
    }
  }
`;

/**
 * 1 January of the current year through now, UTC — the window the heatmap
 * covers. `to` is required: given only `from`, GitHub returns a full year and
 * the grid runs months into the future as empty cells.
 */
function yearToDate(): { from: string; to: string } {
  const now = new Date();
  return {
    from: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString(),
    to: now.toISOString(),
  };
}

const LEVELS = [
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
] as const;

const responseSchema = z.object({
  data: z.object({
    user: z.object({
      contributionsCollection: z.object({
        contributionCalendar: z.object({
          totalContributions: z.number(),
          weeks: z.array(
            z.object({
              contributionDays: z.array(
                z.object({
                  date: z.string(),
                  contributionCount: z.number(),
                  contributionLevel: z.enum(LEVELS),
                }),
              ),
            }),
          ),
        }),
      }),
      pinnedItems: z.object({
        nodes: z.array(
          z.object({
            name: z.string(),
            description: z.string().nullable(),
            url: z.string(),
            stargazerCount: z.number(),
            forkCount: z.number(),
            pushedAt: z.string(),
            primaryLanguage: z.object({ name: z.string() }).nullable(),
          }),
        ),
      }),
      repositories: z.object({
        nodes: z.array(
          z.object({
            languages: z.object({
              edges: z.array(z.object({ size: z.number(), node: z.object({ name: z.string() }) })),
            }),
          }),
        ),
      }),
    }),
  }),
});

export type ContributionDay = {
  date: string;
  count: number;
  /** 0–4, where 4 is the top quartile — the only level rendered in red. */
  level: number;
};

export type GitHubTracker = {
  total: number;
  /** Column-major: each inner array is one week, oldest first. */
  weeks: ContributionDay[][];
  /** Contributions across the most recent 7 calendar days, today included. */
  lastWeek: number;
  longestStreak: number;
  bestDay: ContributionDay;
  repos: {
    name: string;
    description: string | null;
    url: string;
    stars: number;
    forks: number;
    pushedAt: string;
    language: string | null;
  }[];
  languages: { name: string; percent: number }[];
};

/** A `<td>` cell's attributes, in whatever order GitHub renders them. */
function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

/**
 * Parses the profile graph's markup into days, oldest first, dropping any
 * after `today` (the fragment always renders the whole year). Each cell's count
 * lives in the `<tool-tip>` that references its id: "12 contributions on …" or
 * "No contributions on …". Throws when nothing parses so the caller can fall
 * back rather than render an empty year.
 */
export function parseContributionsHtml(html: string, today: string): ContributionDay[] {
  const tips = new Map<string, number>();
  for (const [, tag = "", text = ""] of html.matchAll(/<tool-tip\b([^>]*)>([^<]*)</g)) {
    const id = attr(tag, "for");
    if (id) tips.set(id, Number.parseInt(text.replace(/,/g, ""), 10) || 0);
  }

  const days: ContributionDay[] = [];
  for (const [tag] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]*"[^>]*>/g)) {
    const date = attr(tag, "data-date");
    const id = attr(tag, "id");
    const level = Number(attr(tag, "data-level"));
    if (!date || !id || date > today || !tips.has(id) || !(level >= 0 && level <= 4)) continue;
    days.push({ date, count: tips.get(id) ?? 0, level });
  }

  if (days.length === 0) throw new Error("contribution graph markup did not parse");
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

/** Splits days into Sunday-first columns, matching GraphQL's `weeks` shape. */
export function toWeeks(days: ContributionDay[]): ContributionDay[][] {
  const weeks: ContributionDay[][] = [];
  for (const day of days) {
    const current = weeks.at(-1);
    if (!current || new Date(`${day.date}T00:00:00Z`).getUTCDay() === 0) weeks.push([day]);
    else current.push(day);
  }
  return weeks;
}

async function fetchProfileCalendar(from: string, to: string): Promise<ContributionDay[][]> {
  const response = await fetch(`${CONTRIBUTIONS_URL(site.github)}?from=${from.slice(0, 10)}`);
  if (!response.ok) throw new Error(`GitHub contributions ${response.status}`);
  return toWeeks(parseContributionsHtml(await response.text(), to.slice(0, 10)));
}

/** Walks the flattened calendar once, collecting the streak, the best day, and
 * the trailing week. The calendar ends today, so the last seven entries are the
 * last seven days. */
function summarize(days: ContributionDay[]) {
  let longest = 0;
  let running = 0;
  let best: ContributionDay = days[0] ?? { date: "", count: 0, level: 0 };

  for (const day of days) {
    running = day.count > 0 ? running + 1 : 0;
    if (running > longest) longest = running;
    if (day.count > best.count) best = day;
  }

  const lastWeek = days.slice(-7).reduce((sum, day) => sum + day.count, 0);

  return { longestStreak: longest, lastWeek, bestDay: best };
}

/** Aggregates per-repo language bytes into whole-account percentages. */
function topLanguages(
  nodes: { languages: { edges: { size: number; node: { name: string } }[] } }[],
  limit = 6,
) {
  const totals = new Map<string, number>();
  for (const repo of nodes) {
    for (const edge of repo.languages.edges) {
      totals.set(edge.node.name, (totals.get(edge.node.name) ?? 0) + edge.size);
    }
  }

  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  if (sum === 0) return [];

  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, size]) => ({ name, percent: Math.round((size / sum) * 1000) / 10 }));
}

/**
 * Fetches the tracker, or null if GitHub is unreachable.
 *
 * Returning null rather than throwing keeps a GitHub outage — or a build with
 * no credentials — from taking down the entire page. Callers render a fallback.
 */
export async function getGitHubTracker(): Promise<GitHubTracker | null> {
  try {
    return await fetchTracker();
  } catch (error) {
    console.error("[github]", error);
    return null;
  }
}

async function fetchTracker(): Promise<GitHubTracker> {
  "use cache";
  // A busy day adds hundreds of contributions; "hours" left the tiles up to an
  // hour behind the profile.
  cacheLife({ stale: 300, revalidate: 900, expire: 86_400 });

  const { GITHUB_TOKEN } = requireEnv("GITHUB_TOKEN");
  const range = yearToDate();

  const profileCalendar = fetchProfileCalendar(range.from, range.to).catch((error) => {
    console.error("[github] profile calendar, using GraphQL's", error);
    return null;
  });

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: site.github, ...range },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }

  const { data } = responseSchema.parse(await response.json());
  const calendar = data.user.contributionsCollection.contributionCalendar;

  const weeks =
    (await profileCalendar) ??
    calendar.weeks.map((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS.indexOf(day.contributionLevel),
      })),
    );
  const days = weeks.flat();

  return {
    total: days.reduce((sum, day) => sum + day.count, 0),
    weeks,
    ...summarize(days),
    repos: data.user.pinnedItems.nodes.map((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      pushedAt: repo.pushedAt,
      language: repo.primaryLanguage?.name ?? null,
    })),
    languages: topLanguages(data.user.repositories.nodes),
  };
}
