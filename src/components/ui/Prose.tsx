import { cacheLife } from "next/cache";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

/**
 * Renders post bodies. Typography lives here rather than in each post, so every
 * article shares one vertical rhythm.
 *
 * Cached: MDX compilation is deterministic for a given source, and the compiler
 * reads the clock internally, which would otherwise block prerendering.
 */
export async function Prose({ source }: { source: string }) {
  "use cache";
  cacheLife("max");

  return (
    <div className="[&_a]:link-sweep max-w-[68ch] space-y-5 text-ash-2 leading-relaxed [&_a]:text-ash-3 [&_blockquote]:border-ink-3 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-ash-1 [&_code]:font-mono [&_code]:text-[0.85em] [&_h2]:pt-4 [&_h2]:font-medium [&_h2]:text-ash-3 [&_h2]:text-lg [&_h3]:font-medium [&_h3]:text-ash-3 [&_li]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-ink-3 [&_pre]:p-4 [&_pre]:text-sm [&_strong]:text-ash-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug, [rehypePrettyCode, { theme: "vesper" }]],
          },
        }}
      />
    </div>
  );
}
