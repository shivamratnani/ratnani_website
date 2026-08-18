import { cacheLife } from "next/cache";
import { z } from "zod";
import { site } from "@/data/site";
import { requireEnv } from "./env";

const ENDPOINT = "https://api.github.com/graphql";

/**
 * One query answers the whole tracker: calendar, pinned repos, and languages.
 * Streaks are derived from the calendar rather than fetched separately.
 */
const QUERY = /* GraphQL */ `
  query Tracker($login: String!) {
    user(login: $login) {
      contributionsCollection {
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
  currentStreak: number;
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

/** Walks the flattened calendar once, collecting both streaks and the best day. */
function summarize(days: ContributionDay[]) {
  let longest = 0;
  let running = 0;
  let best: ContributionDay = days[0] ?? { date: "", count: 0, level: 0 };

  for (const day of days) {
    running = day.count > 0 ? running + 1 : 0;
    if (running > longest) longest = running;
    if (day.count > best.count) best = day;
  }

  // Current streak counts back from the most recent day. Today is skipped when
  // empty — the day is still in progress and shouldn't break an active streak.
  let current = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    const day = days[i];
    if (!day) break;
    if (day.count === 0) {
      if (i === days.length - 1) continue;
      break;
    }
    current += 1;
  }

  return { longestStreak: longest, currentStreak: current, bestDay: best };
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
  cacheLife("hours");

  const { GITHUB_TOKEN } = requireEnv("GITHUB_TOKEN");

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { login: site.github } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }

  const { data } = responseSchema.parse(await response.json());
  const calendar = data.user.contributionsCollection.contributionCalendar;

  const weeks = calendar.weeks.map((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVELS.indexOf(day.contributionLevel),
    })),
  );

  return {
    total: calendar.totalContributions,
    weeks,
    ...summarize(weeks.flat()),
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
