import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getPosts } from "@/lib/mdx";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  return [
    { url: site.url, priority: 1 },
    ...["/photography", "/writing", "/now"].map((path) => ({
      url: `${site.url}${path}`,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${site.url}/writing/${post.slug}`,
      lastModified: post.date,
      priority: 0.6,
    })),
  ];
}
