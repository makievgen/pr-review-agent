import { Octokit } from '@octokit/rest';
import type { Finding } from './review.js';

const gh = new Octokit({ auth: process.env.GITHUB_TOKEN });
const [owner, repo] = (process.env.REPO ?? '').split('/');
const pull_number = Number(process.env.PR_NUMBER);

export async function getDiff(): Promise<string> {
  const res = await gh.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: 'diff' },
  });
  return res.data as unknown as string;
}

export async function postReview(findings: Finding[]) {
  if (findings.length === 0) {
    await gh.pulls.createReview({
      owner,
      repo,
      pull_number,
      event: 'COMMENT',
      body: 'AI review: no confident findings.',
    });
    return;
  }

  await gh.pulls.createReview({
    owner,
    repo,
    pull_number,
    event: 'COMMENT',
    body: `AI review: ${findings.length} finding(s).`,
    comments: findings.map(f => ({
      path: f.file,
      line: f.line,
      body: `**${f.severity} · ${f.category}**\n\n${f.issue}\n\n${f.why}`,
    })),
  });
}
