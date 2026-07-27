const { verifyAuth } = require('./_github');

module.exports = async function handler(req, res) {
  const user = verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please login.' });
  }

  const isConfigured = Boolean(
    process.env.GITHUB_TOKEN &&
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_REPO
  );

  return res.status(200).json({
    status: 'online',
    githubConfigured: isConfigured,
    owner: process.env.GITHUB_OWNER || 'Not configured (using local file system)',
    repo: process.env.GITHUB_REPO || 'Not configured',
    branch: process.env.GITHUB_BRANCH || 'main'
  });
};
