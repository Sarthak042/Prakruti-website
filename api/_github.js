const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const JWT_SECRET = process.env.JWT_SECRET || 'prakruti_secure_jwt_secret_key_2026_98230';

/**
 * Verify JWT token from Cookies or Auth Header
 */
function verifyAuth(req) {
  try {
    let token = null;

    // Check Cookie header
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      token = cookies.token;
    }

    // Check Authorization header
    if (!token && req.headers.authorization) {
      if (req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.substring(7);
      }
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Get JSON content from GitHub or local file system
 */
async function getJsonFile(filePath) {
  if (GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Prakruti-CMS-App'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`GitHub API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const contentStr = Buffer.from(data.content, 'base64').toString('utf-8');
    return {
      data: JSON.parse(contentStr),
      sha: data.sha
    };
  } else {
    // Fallback to local file system
    const localPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local file not found: ${filePath}`);
    }
    const raw = fs.readFileSync(localPath, 'utf-8');
    return {
      data: JSON.parse(raw),
      sha: 'local-sha'
    };
  }
}

/**
 * Update JSON content on GitHub API or local file system
 */
async function updateJsonFile(filePath, jsonObject, commitMessage) {
  const jsonString = JSON.stringify(jsonObject, null, 2);

  if (GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
    // 1. Get current SHA
    const currentFile = await getJsonFile(filePath);
    const sha = currentFile.sha;

    // 2. Commit update to GitHub
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    const base64Content = Buffer.from(jsonString).toString('base64');

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Prakruti-CMS-App'
      },
      body: JSON.stringify({
        message: commitMessage || `Update ${filePath}`,
        content: base64Content,
        sha: sha,
        branch: GITHUB_BRANCH
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`GitHub API Commit Error (${response.status}): ${errText}`);
    }

    return await response.json();
  } else {
    // Fallback to local file system
    const localPath = path.join(process.cwd(), filePath);
    fs.writeFileSync(localPath, jsonString, 'utf-8');
    return { success: true, local: true };
  }
}

module.exports = {
  verifyAuth,
  getJsonFile,
  updateJsonFile,
  JWT_SECRET
};
