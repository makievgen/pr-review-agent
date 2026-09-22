# Eval harness (scaffold — not yet populated)

This is the part that turns "I built an AI review agent" into "I measured how good it actually is."

## Idea

For each case in `cases/`, seed a known defect into a small before/after code pair, run the agent's review logic against the diff, and check whether it found (or correctly stayed silent on) the seeded issue.

```
eval/
├── cases/
│   ├── 001-off-by-one/
│   │   ├── before.ts
│   │   ├── after.ts
│   │   └── expected.json
│   ├── 002-null-deref/
│   └── ...
├── results/            # dated run output goes here, per prompt version
└── run.ts              # not yet written
```

## `expected.json` format

```json
{
  "shouldFind": true,
  "category": "logic",
  "line": 42,
  "note": "loop uses <= on array length, reads one past the end"
}
```

For a clean case (no real bug), set `"shouldFind": false` — the agent should stay silent, and staying silent counts as correct.

## Plan

- ~20 defect cases, 4 per category (logic / null / resource / security / concurrency) + ~10 clean cases.
- `run.ts` diffs `before.ts` → `after.ts` for each case, runs it through `src/review.ts`, and compares findings against `expected.json`.
- Report: recall (seeded bugs actually found), precision (findings that were real bugs), false-positives-per-clean-PR.
- Store each run's output in `results/`, named by prompt version, so prompt changes can be compared over time.

## Status

No cases are written yet and `run.ts` doesn't exist. This directory is the plan, not the harness. Filling it in with real seeded-defect cases (ideally pulled from real bugs in this author's own past PRs) is the next step after the agent itself is confirmed working end-to-end.
