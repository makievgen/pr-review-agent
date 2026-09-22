# PR Review Agent

An AI code-review agent that comments on GitHub pull requests. Runs as a GitHub Action, uses Groq's free-tier LLM API, costs 0 kr to run.

**Status: working, not yet measured.** The agent posts real review comments on real PRs. What it does *not* have yet is a precision/recall number — that requires the eval harness described below, which is still on the roadmap. Any claim like "catches N% of bugs" would be fabricated until that harness exists and has actually been run, so this README doesn't make one.

## What it does

On every PR open/update, a GitHub Action:
1. Pulls the PR's unified diff via the GitHub API.
2. Sends it to an LLM (Groq, `openai/gpt-oss-120b`) with a prompt tuned to favor silence over noise — the instruction is explicit that a false positive costs more than a missed nit.
3. Parses the model's JSON findings and posts them as an inline PR review (or a single "no confident findings" comment if there's nothing to flag).

## Why it's built this way

- **Groq, not OpenAI/Anthropic directly** — free tier, no card required, OpenAI-compatible API so the code is swappable later.
- **`temperature: 0.1`** — not a style choice. Low temperature makes runs reproducible, which matters once there's an eval harness comparing prompt versions against each other.
- **JSON-only output, empty array is valid** — makes the model's silence a first-class, parseable outcome instead of something to regex out of prose.
- **Diff truncated at 60k characters** — a crude guard against blowing the model's context window on huge PRs. A real fix (chunking) is future work, not implemented here.

## Setup

1. **Get a free Groq API key**: [console.groq.com](https://console.groq.com) → API Keys. No credit card.
2. **Fork or clone this repo.**
3. **Add repo secrets** (Settings → Secrets and variables → Actions):
   - `GROQ_API_KEY` — from step 1.
   - `GITHUB_TOKEN` is provided automatically by Actions; you don't need to add it yourself.
4. Open a PR against the repo. The `AI Code Review` workflow runs automatically and comments on it.

### Running locally

```bash
npm install
cp .env.example .env   # fill in GROQ_API_KEY, GITHUB_TOKEN (a PAT), PR_NUMBER, REPO
npm run review
```

## Project structure

```
pr-review-agent/
├── .github/workflows/review.yml   # triggers the agent on PR open/sync
├── src/
│   ├── index.ts     # entry point: fetch diff -> review -> post
│   ├── github.ts     # GitHub API: get diff, post review comments
│   ├── review.ts     # calls the LLM, parses findings
│   └── prompt.ts     # the system prompt
├── eval/              # scaffold for the precision/recall harness — see below
├── package.json
└── tsconfig.json
```

## Roadmap (honest, not yet done)

- [ ] **Eval harness** (`eval/`) — seed known defects into before/after code pairs, run the agent against each, compute recall / precision / false-positives-per-clean-PR. This is the part that would actually justify a claim about how good the agent is. Scaffold exists; no cases are populated yet.
- [ ] Results table in this README, once the harness has real runs to report.
- [ ] Diff chunking for PRs over the character limit, instead of truncation.
- [ ] Optional: move off GitHub Actions minutes to a scheduled/queued runner if usage grows.

## Limitations

- No precision/recall numbers yet (see Roadmap).
- Diffs over ~60k characters are truncated, not chunked — findings past the cutoff are missed.
- Only tested against this author's own and public repositories. **Do not point this at employer or client code** — free-tier LLM providers may use submitted inputs for training, so anything sent through it should be code you're allowed to share externally.
- Single review pass per push; no conversation/follow-up with the model.

## Security notes

- API keys live only in GitHub Actions Secrets, never in code or a committed `.env`.
- `permissions:` in the workflow are scoped to `contents: read` and `pull-requests: write` — nothing broader.

## License

MIT — see [LICENSE](LICENSE).
