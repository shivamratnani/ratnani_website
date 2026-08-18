import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { z } from "zod";

const CONTENT_DIR = join(process.cwd(), "content", "writing");

const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.iso.date(),
  /** Unpublished drafts are readable by slug but never listed or in the sitemap. */
  draft: z.boolean().default(false),
});

export type Post = z.infer<typeof frontmatterSchema> & { slug: string; body: string };

/** Minimal YAML frontmatter reader — flat scalars only, which is all posts use. */
function parse(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match?.[1]) return { data: {}, body: raw };

  const data: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!pair?.[1]) continue;

    const value = (pair[2] ?? "").trim().replace(/^["']|["']$/g, "");
    data[pair[1]] = value === "true" ? true : value === "false" ? false : value;
  }

  return { data, body: match[2] ?? "" };
}

async function read(slug: string): Promise<Post> {
  "use cache";
  cacheLife("max");

  const raw = await readFile(join(CONTENT_DIR, `${slug}.mdx`), "utf8");
  const { data, body } = parse(raw);
  return { ...frontmatterSchema.parse(data), slug, body };
}

/**
 * Every slug on disk, drafts included.
 *
 * Distinct from getPosts(): drafts are reachable by direct URL so they can be
 * previewed before publishing, they are just never listed or in the sitemap.
 * Cache Components also requires generateStaticParams to return at least one
 * result, so this must not filter.
 */
export async function getSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("max");

  const files = await readdir(CONTENT_DIR).catch(() => []);
  return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
}

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheLife("max");

  const files = await readdir(CONTENT_DIR).catch(() => []);
  const posts = await Promise.all(
    files.filter((file) => file.endsWith(".mdx")).map((file) => read(file.replace(/\.mdx$/, ""))),
  );

  return posts.filter((post) => !post.draft).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | null> {
  return read(slug).catch(() => null);
}

export const formatDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
