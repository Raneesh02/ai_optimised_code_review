const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
  let setStatus = async () => {};
  try {
    const dryRun = process.env.DRY_RUN === 'true';
    const prNumber = process.env.PR_NUMBER;
    const repository = process.env.REPOSITORY;
    const githubToken = process.env.GITHUB_TOKEN;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.error('Missing required environment variable: GEMINI_API_KEY');
      process.exit(1);
    }

    if (!dryRun && (!prNumber || !repository || !githubToken)) {
      console.error('Missing required environment variables for PR review: PR_NUMBER, REPOSITORY, GITHUB_TOKEN');
      process.exit(1);
    }

    setStatus = async (state, description) => {
      if (dryRun) return;
      const headSha = execSync('git rev-parse HEAD').toString().trim();
      const response = await fetch(`https://api.github.com/repos/${repository}/statuses/${headSha}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          state,
          description,
          context: 'ai-review'
        })
      });
      if (!response.ok) {
        console.error(`Failed to set commit status: ${response.statusText}`, await response.text());
      }
    };

    await setStatus('pending', 'AI PR Code Review is in progress...');
    if (!dryRun) {
      console.log('Verifying status of static-checks...');
      const headSha = execSync('git rev-parse HEAD').toString().trim();
      const checksResponse = await fetch(`https://api.github.com/repos/${repository}/commits/${headSha}/check-runs`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!checksResponse.ok) {
        throw new Error(`Failed to fetch commit checks: ${checksResponse.statusText}`);
      }

      const checksData = await checksResponse.json();
      const staticCheck = checksData.check_runs.find(run => run.name === 'static-checks');

      if (!staticCheck || staticCheck.conclusion !== 'success') {
        const currentConclusion = staticCheck ? staticCheck.conclusion : 'not started';
        console.log(`Static checks are not successful (current state: ${currentConclusion}). Posting skip message...`);

        const skipMessage = `## Summary

Overall Risk: Low

*Takeaway:* **"Don't spend expensive intelligence on cheap problems."**

## Findings

None.

## Human Review Required

No

**Reason:** AI review was skipped because the required **static-checks** status check is currently: \`${currentConclusion}\`. Please resolve all static checks before triggering code_review.`;

        const prResponse = await fetch(`https://api.github.com/repos/${repository}/pulls/${prNumber}/reviews`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            body: skipMessage,
            event: 'COMMENT'
          })
        });

        if (!prResponse.ok) {
          console.error('Failed to post skip message comment:', await prResponse.text());
        }

        await setStatus('failure', 'AI review skipped: static checks must pass first.');
        process.exit(0);
      }
    }

    console.log('Fetching git diff...');
    // Fetch target branch so we can diff against it
    execSync('git fetch origin main --depth=1');
    const diff = execSync('git diff origin/main...HEAD').toString();

    if (!diff.trim()) {
      console.log('No diff found. Skipping review.');
      process.exit(0);
    }

    console.log('Reading AGENTS.md rules...');
    const rules = fs.readFileSync('.agents/AGENTS.md', 'utf8');

    console.log('Generating AI review...');
    const prompt = `You are a senior engineer reviewing a pull request for a Playwright framework project.
Review the following git diff against the project's coding standards.

Project Coding Standards (from AGENTS.md):
"""
${rules}
"""

Git Diff to Review:
"""
${diff}
"""

Please write your review in markdown format following this structure exactly:

## Summary

Overall Risk: [Low | Medium | High]

## Findings

**Severity:** [Critical | High | Medium | Low]
**File:** [file path]
**Issue:** [clear explanation of the issue]
**Reason:** [why it matters, including its impact]
**Suggested Fix:** [description of improvement; do NOT output rewritten code blocks unless specifically requested; keep code suggestions minimal]

*(Repeat the Findings block above for each finding. If no findings are present, output "None.")*

## Human Review Required

[Yes / No]

**Reason:** [Clear explanation of why human review is required if Yes (e.g. changes touch critical business logic like payment, auth, feature flags), or why not if No.]
`;

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Gemini API request failed: ${apiResponse.statusText}\n${errorText}`);
    }

    const data = await apiResponse.json();
    const reviewText = data.candidates[0].content.parts[0].text;

    if (dryRun) {
      console.log('\n=== DRY RUN AI REVIEW OUTPUT ===\n');
      console.log(reviewText);
      console.log('\n=================================\n');
    } else {
      console.log('Posting review back to GitHub PR...');
      const prResponse = await fetch(`https://api.github.com/repos/${repository}/pulls/${prNumber}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: reviewText,
          event: 'COMMENT'
        })
      });

      if (!prResponse.ok) {
        const errorText = await prResponse.text();
        throw new Error(`GitHub API request failed: ${prResponse.statusText}\n${errorText}`);
      }

      console.log('Review posted successfully!');
      await setStatus('success', 'AI Code Review completed successfully.');
    }
  } catch (error) {
    console.error('Error executing AI review:', error);
    await setStatus('error', 'AI Code Review encountered an error.');
    process.exit(1);
  }
}

main();
