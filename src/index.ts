import { getDiff, postReview } from './github.js';
import { review } from './review.js';

const MAX_DIFF = 60_000; // characters — a rough guard against the token limit

async function main() {
  let diff = await getDiff();
  if (diff.length > MAX_DIFF) {
    console.warn(`diff truncated: ${diff.length} -> ${MAX_DIFF}`);
    diff = diff.slice(0, MAX_DIFF);
  }

  const findings = await review(diff);
  console.log(`findings: ${findings.length}`);
  await postReview(findings);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
