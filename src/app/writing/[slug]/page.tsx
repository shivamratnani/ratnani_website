import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Prose } from "@/components/ui/Prose";
import { Section } from "@/components/ui/Section";
import { formatDate, getPost, getSlugs } from "@/lib/mdx";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: { type: "article", title: post.title, description: post.description },
  };
}

export default async function PostPage({ params }: Params) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  return (
    <Section id="post">
      <Reveal className="mb-8">
        <time dateTime={post.date} className="font-mono text-[11px] text-ash-1">
          {formatDate(post.date)}
        </time>
        <h1 className="mt-2 text-balance font-medium text-2xl text-ash-3 tracking-tight">
          {post.title}
        </h1>
      </Reveal>
      <Reveal>
        <Prose source={post.body} />
      </Reveal>
    </Section>
  );
}
