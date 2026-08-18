import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Card } from "@/components/ui/Card";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { GitHubTracker } from "@/lib/github";

export function PinnedRepos({ repos }: { repos: GitHubTracker["repos"] }) {
  if (repos.length === 0) return null;

  return (
    <Stagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {repos.map((repo) => (
        <StaggerItem key={repo.name}>
          <a href={repo.url} target="_blank" rel="noreferrer noopener" className="block h-full">
            <Card interactive className="flex h-full flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-ash-3 text-sm">{repo.name}</span>
                {repo.stars > 0 ? (
                  <span className="font-mono text-[11px] text-ash-1">★ {repo.stars}</span>
                ) : null}
              </div>
              {repo.description ? (
                <p className="line-clamp-2 text-ash-2 text-sm leading-relaxed">
                  {repo.description}
                </p>
              ) : null}
              <div className="mt-auto flex items-center gap-3 pt-1 font-mono text-[11px] text-ash-1">
                {repo.language ? <span>{repo.language}</span> : null}
                <TimeAgo value={repo.pushedAt} />
              </div>
            </Card>
          </a>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
