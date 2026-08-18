import type { Metadata } from "next";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Section } from "@/components/ui/Section";
import { formatDate, getPosts } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on systems that had to work.",
};

export default async function WritingPage() {
  const posts = await getPosts();

  return (
    <Section id="writing" index="—" title="Blog">
      {posts.length === 0 ? (
        <p className="text-ash-1">Nothing published yet.</p>
      ) : (
        <Stagger className="space-y-px">
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <Link
                href={`/writing/${post.slug}`}
                className="group block rounded-md px-3 py-4 transition-colors duration-300 hover:bg-ink-1"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-medium text-ash-3 text-sm group-hover:text-red">
                    {post.title}
                  </h2>
                  <time
                    dateTime={post.date}
                    className="font-mono text-[11px] text-ash-1 tabular-nums"
                  >
                    {formatDate(post.date)}
                  </time>
                </div>
                <p className="mt-1.5 text-ash-1 text-sm leading-relaxed">{post.description}</p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </Section>
  );
}
