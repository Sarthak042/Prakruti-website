const { verifyAuth, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = require('./_github');

module.exports = async function handler(req, res) {
  const user = verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  const isConfigured = Boolean(GITHUB_TOKEN);

  return res.status(200).json({
    status: 'online',
    githubConfigured: isConfigured,
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    message: isConfigured
      ? `Connected to GitHub repository ${GITHUB_OWNER}/${GITHUB_REPO} (${GITHUB_BRANCH})`
      : `GITHUB_TOKEN missing in environment variables. Add GITHUB_TOKEN to Vercel Environment Variables to enable live GitHub commits.`
  });
};
